-- =====================================================================
-- PataForte | Schema v3 (banco NOVO) para Supabase / PostgreSQL
-- Supabase > SQL Editor > New query > cole tudo > Run
-- Já tem as tabelas criadas? Use supabase/migracao_v3.sql em vez deste.
-- =====================================================================

-- Status exatamente como o app envia: 'Pendente' e 'Concluído'
create type status_agendamento as enum ('Pendente', 'Concluído');

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- CLIENTES ----------
create table clientes (
  id          bigint generated always as identity primary key,
  nome        text not null check (length(trim(nome)) > 0),
  telefone    text not null,
  endereco    text,
  email       text unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- ANIMAIS (Regra 2: cliente_id obrigatório) ----------
create table animais (
  id          bigint generated always as identity primary key,
  cliente_id  bigint not null references clientes(id) on update cascade on delete restrict,
  nome        text not null check (length(trim(nome)) > 0),
  especie     text not null check (especie in ('cão', 'gato')),
  raca        text,
  idade       smallint check (idade >= 0 and idade <= 40),
  foto_url    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (id, cliente_id)
);

-- ---------- SERVIÇOS ----------
create table servicos (
  id          bigint generated always as identity primary key,
  nome        text not null unique check (length(trim(nome)) > 0),
  descricao   text,
  valor       numeric(10,2) not null check (valor >= 0),
  ativo       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- AGENDAMENTOS ----------
create table agendamentos (
  id          bigint generated always as identity primary key,
  cliente_id  bigint not null,
  animal_id   bigint not null,
  servico_id  bigint not null references servicos(id) on update cascade on delete restrict,
  data        date not null,
  horario     time not null,
  status      status_agendamento not null default 'Pendente',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- o animal precisa pertencer ao cliente informado
  constraint fk_agendamento_animal_cliente
    foreign key (animal_id, cliente_id) references animais (id, cliente_id)
    on update cascade on delete restrict,
  -- Regra 1: mesmo dia + mesmo horário não pode ser ocupado duas vezes
  constraint ux_agendamento_horario_unico unique (data, horario)
);

-- ---------- HISTÓRICO ----------
create table historico_servicos (
  id              bigint generated always as identity primary key,
  agendamento_id  bigint not null unique references agendamentos(id) on delete restrict,
  animal_id       bigint not null references animais(id) on update cascade on delete restrict,
  servico_id      bigint not null references servicos(id) on update cascade on delete restrict,
  data_servico    date not null,
  valor           numeric(10,2) not null check (valor >= 0),
  created_at      timestamptz not null default now()
);

create index ix_animais_cliente      on animais (cliente_id);
create index ix_agendamentos_status  on agendamentos (status, data, horario);
create index ix_historico_animal     on historico_servicos (animal_id, data_servico desc);

create trigger trg_clientes_updated     before update on clientes     for each row execute function set_updated_at();
create trigger trg_animais_updated      before update on animais      for each row execute function set_updated_at();
create trigger trg_servicos_updated     before update on servicos     for each row execute function set_updated_at();
create trigger trg_agendamentos_updated before update on agendamentos for each row execute function set_updated_at();

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

-- ---------- RLS: só usuários logados (equipe) ----------
alter table clientes           enable row level security;
alter table animais            enable row level security;
alter table servicos           enable row level security;
alter table agendamentos       enable row level security;
alter table historico_servicos enable row level security;

create policy "acesso autenticado" on clientes           for all to authenticated using (true) with check (true);
create policy "acesso autenticado" on animais            for all to authenticated using (true) with check (true);
create policy "acesso autenticado" on servicos           for all to authenticated using (true) with check (true);
create policy "acesso autenticado" on agendamentos       for all to authenticated using (true) with check (true);
create policy "acesso autenticado" on historico_servicos for all to authenticated using (true) with check (true);

-- ---------- Dados de exemplo (opcional) ----------
insert into servicos (nome, descricao, valor) values
  ('Banho',          'Banho com shampoo e secagem',        50.00),
  ('Tosa',           'Tosa higiênica ou completa',         70.00),
  ('Banho e Tosa',   'Pacote completo de banho e tosa',   110.00),
  ('Corte de unhas', 'Corte e lixamento das unhas',        25.00);

insert into clientes (nome, telefone, endereco, email) values
  ('Maria Silva', '(51) 99999-0001', 'Rua das Flores, 100', 'maria@email.com'),
  ('João Souza',  '(51) 99999-0002', 'Av. Central, 250',    'joao@email.com');

insert into animais (cliente_id, nome, especie, raca, idade) values
  (1, 'Thor', 'cão',  'Golden Retriever', 4),
  (1, 'Mia',  'gato', 'Siamês',           2),
  (2, 'Bob',  'cão',  'Poodle',           6);
