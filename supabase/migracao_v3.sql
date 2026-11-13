-- =====================================================================
-- PataForte | MIGRAÇÃO v3 (para quem JÁ criou as tabelas)
-- Mantém seus dados. Corrige o erro:
--   invalid input value for enum status_agendamento: "pendente"
-- Padroniza o enum para ('Pendente', 'Concluído'), adiciona foto_url
-- em animais e cria o bucket de fotos. Rode uma vez no SQL Editor.
-- =====================================================================

-- 1) Remove o que depende da coluna status
drop view if exists vw_agendamentos_detalhados;
drop trigger if exists trg_agendamento_concluido on agendamentos;
drop trigger if exists trg_bloquear_reabertura on agendamentos;
alter table agendamentos drop constraint if exists ux_agendamento_horario_unico;
drop index if exists ux_agendamento_horario_unico;

-- 2) Converte a coluna para texto e normaliza os valores antigos
alter table agendamentos alter column status drop default;
alter table agendamentos alter column status type text using status::text;

-- (v1 tinha 'cancelado': agendamentos cancelados sem histórico são removidos para liberar o horário)
delete from agendamentos a
 where lower(a.status) like 'cancel%'
   and not exists (select 1 from historico_servicos h where h.agendamento_id = a.id);

update agendamentos
   set status = case when lower(status) like 'conclu%' then 'Concluído' else 'Pendente' end;

-- 3) Recria o enum com os valores que o app envia
drop type if exists status_agendamento;
create type status_agendamento as enum ('Pendente', 'Concluído');

alter table agendamentos
  alter column status type status_agendamento using status::status_agendamento;
alter table agendamentos alter column status set default 'Pendente';

-- 4) Regra 1: um horário por dia (data + horário únicos)
alter table agendamentos
  add constraint ux_agendamento_horario_unico unique (data, horario);

-- 5) Foto do animal
alter table animais add column if not exists foto_url text;

-- ---------- Regra 3: 'Concluído' grava automaticamente no histórico ----------
-- (mesma transação do UPDATE: ou grava os dois, ou nenhum)
create or replace function registrar_historico_ao_concluir()
returns trigger language plpgsql as $$
declare v_valor numeric(10,2);
begin
  if new.status = 'Concluído' and (tg_op = 'INSERT' or old.status is distinct from 'Concluído') then
    select valor into v_valor from servicos where id = new.servico_id;
    insert into historico_servicos (agendamento_id, animal_id, servico_id, data_servico, valor)
    values (new.id, new.animal_id, new.servico_id, new.data, v_valor)
    on conflict (agendamento_id) do nothing;
  end if;
  return new;
end $$;

-- Impede "reabrir" um agendamento já concluído (o histórico já foi gravado)
create or replace function bloquear_reabertura()
returns trigger language plpgsql as $$
begin
  if old.status = 'Concluído' and new.status <> 'Concluído' then
    raise exception 'AGENDAMENTO_JA_CONCLUIDO';
  end if;
  return new;
end $$;

drop trigger if exists trg_bloquear_reabertura on agendamentos;
create trigger trg_bloquear_reabertura
  before update of status on agendamentos
  for each row execute function bloquear_reabertura();

drop trigger if exists trg_agendamento_concluido on agendamentos;
create trigger trg_agendamento_concluido
  after insert or update of status on agendamentos
  for each row execute function registrar_historico_ao_concluir();

-- ---------- VIEW de consulta (agora com a foto do animal) ----------
create or replace view vw_agendamentos_detalhados
with (security_invoker = true) as
select a.id, a.data, a.horario, a.status,
       c.nome as cliente, c.telefone as telefone_cliente,
       an.nome as animal, an.especie, an.foto_url,
       s.nome as servico, s.valor as valor_servico
from agendamentos a
join clientes c  on c.id  = a.cliente_id
join animais  an on an.id = a.animal_id
join servicos s  on s.id  = a.servico_id;

-- ---------- STORAGE: bucket público "animais" para as fotos dos pets ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('animais', 'animais', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "animais_fotos_leitura" on storage.objects;
create policy "animais_fotos_leitura" on storage.objects
  for select using (bucket_id = 'animais');

drop policy if exists "animais_fotos_upload" on storage.objects;
create policy "animais_fotos_upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'animais');

drop policy if exists "animais_fotos_update" on storage.objects;
create policy "animais_fotos_update" on storage.objects
  for update to authenticated using (bucket_id = 'animais') with check (bucket_id = 'animais');

drop policy if exists "animais_fotos_delete" on storage.objects;
create policy "animais_fotos_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'animais');
