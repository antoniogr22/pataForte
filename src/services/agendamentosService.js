import { supabase } from './supabase';
import { ErroNegocio } from '../utils/erros';
import { normalizarHorario } from '../utils/horarios';
import { STATUS } from '../utils/status';

const MSG_OCUPADO = 'Este horário já está ocupado por outro serviço. Escolha outro horário.';

// Lista os horários ('HH:MM') já ocupados em uma data
export async function listarHorariosOcupados(dataISO) {
  const { data, error } = await supabase.from('agendamentos').select('horario').eq('data', dataISO);
  if (error) throw error;
  return data.map((r) => normalizarHorario(r.horario));
}

// Regra 1 (checagem prévia): consulta o Supabase para ver se data + horário já existem
export async function horarioEstaOcupado(dataISO, horario) {
  const { count, error } = await supabase
    .from('agendamentos')
    .select('id', { count: 'exact', head: true })
    .eq('data', dataISO)
    .eq('horario', horario);
  if (error) throw error;
  return count > 0;
}

// Regra 1 (garantia final): a constraint UNIQUE (data, horario) do banco
// também barra a gravação se dois atendentes salvarem ao mesmo tempo (erro 23505).
export async function criarAgendamento({ clienteId, animalId, servicoId, data, horario }) {
  if (await horarioEstaOcupado(data, horario)) {
    throw new ErroNegocio('HORARIO_OCUPADO', MSG_OCUPADO);
  }

  const { data: row, error } = await supabase
    .from('agendamentos')
    .insert({
      cliente_id: clienteId,
      animal_id: animalId,
      servico_id: servicoId,
      data,
      horario,
      status: STATUS.PENDENTE, // 'Pendente' (igual ao enum do banco)
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new ErroNegocio('HORARIO_OCUPADO', MSG_OCUPADO);
    throw error;
  }
  return row;
}

export async function listarAgendamentos(status = null) {
  let query = supabase
    .from('vw_agendamentos_detalhados')
    .select('*')
    .order('data', { ascending: true })
    .order('horario', { ascending: true });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Regra 3: atualiza o status para 'Concluído'.
// O INSERT em historico_servicos é feito pelo trigger trg_agendamento_concluido,
// na MESMA transação do UPDATE (grava os dois ou nenhum, e nunca duplica).
export async function concluirAgendamento(agendamentoId) {
  const { data: atualizado, error } = await supabase
    .from('agendamentos')
    .update({ status: STATUS.CONCLUIDO })
    .eq('id', agendamentoId)
    .eq('status', STATUS.PENDENTE) // evita concluir duas vezes
    .select('id')
    .maybeSingle();

  if (error) throw error;
  if (!atualizado) {
    throw new ErroNegocio('JA_CONCLUIDO', 'Este agendamento já foi concluído ou não existe mais.');
  }

  const { data: historico, error: erroHist } = await supabase
    .from('historico_servicos')
    .select('id, data_servico, valor, animais(nome), servicos(nome)')
    .eq('agendamento_id', agendamentoId)
    .single();

  if (erroHist) throw erroHist;
  return historico;
}

// Histórico: serviço realizado, data e valor pago (opcionalmente de um animal só)
export async function listarHistorico(animalId = null) {
  let query = supabase
    .from('historico_servicos')
    .select('id, data_servico, valor, animal_id, animais(nome, foto_url), servicos(nome)')
    .order('data_servico', { ascending: false })
    .order('id', { ascending: false });
  if (animalId) query = query.eq('animal_id', animalId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
