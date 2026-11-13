import { supabase } from './supabase';
import { ErroNegocio } from '../utils/erros';

const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ---------------- CLIENTES ----------------
export async function listarClientes() {
  const { data, error } = await supabase.from('clientes').select('id, nome, telefone, endereco, email').order('nome');
  if (error) throw error;
  return data;
}

export async function criarCliente({ nome, telefone, endereco, email }) {
  if (!nome?.trim()) throw new ErroNegocio('NOME_OBRIGATORIO', 'Informe o nome do cliente.');
  if (!telefone?.trim()) throw new ErroNegocio('TELEFONE_OBRIGATORIO', 'Informe o telefone do cliente.');
  if (email?.trim() && !emailValido(email.trim())) throw new ErroNegocio('EMAIL_INVALIDO', 'Informe um e-mail válido.');

  const { data, error } = await supabase
    .from('clientes')
    .insert({
      nome: nome.trim(),
      telefone: telefone.trim(),
      endereco: endereco?.trim() || null,
      email: email?.trim() || null,
    })
    .select()
    .single();
  if (error) {
    if (error.code === '23505') throw new ErroNegocio('EMAIL_DUPLICADO', 'Já existe um cliente com este e-mail.');
    throw error;
  }
  return data;
}

// ---------------- ANIMAIS ----------------
export async function listarAnimais() {
  const { data, error } = await supabase
    .from('animais')
    .select('id, nome, especie, raca, idade, foto_url, clientes(nome)')
    .order('nome');
  if (error) throw error;
  return data;
}

export async function listarAnimaisPorCliente(clienteId) {
  const { data, error } = await supabase
    .from('animais')
    .select('id, nome, especie, raca, foto_url')
    .eq('cliente_id', clienteId)
    .order('nome');
  if (error) throw error;
  return data;
}

// Regra 2: todo animal precisa de um cliente (validado aqui e no banco: NOT NULL + FK)
export async function criarAnimal({ clienteId, nome, especie, raca, idade, fotoUrl }) {
  if (!clienteId) throw new ErroNegocio('CLIENTE_OBRIGATORIO', 'Selecione o cliente responsável pelo animal.');
  if (!nome?.trim()) throw new ErroNegocio('NOME_OBRIGATORIO', 'Informe o nome do animal.');
  if (!especie) throw new ErroNegocio('ESPECIE_OBRIGATORIA', 'Informe a espécie do animal.');

  const { data, error } = await supabase
    .from('animais')
    .insert({
      cliente_id: clienteId,
      nome: nome.trim(),
      especie,
      raca: raca?.trim() || null,
      idade: idade === '' || idade == null ? null : Number(idade),
      foto_url: fotoUrl || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------------- SERVIÇOS ----------------
export async function listarServicos({ incluirInativos = false } = {}) {
  let query = supabase.from('servicos').select('id, nome, descricao, valor, ativo').order('nome');
  if (!incluirInativos) query = query.eq('ativo', true);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function buscarServico(id) {
  const { data, error } = await supabase.from('servicos').select('id, nome, descricao, valor, ativo').eq('id', id).single();
  if (error) throw error;
  return data;
}

// Cria (sem id) ou atualiza (com id) um serviço. Aqui se controla o valor cobrado.
export async function salvarServico({ id, nome, descricao, valor, ativo = true }) {
  if (!nome?.trim()) throw new ErroNegocio('NOME_OBRIGATORIO', 'Informe o nome do serviço.');
  if (!Number.isFinite(valor) || valor < 0) throw new ErroNegocio('VALOR_INVALIDO', 'Informe um valor válido (ex.: 50,00).');

  const registro = { nome: nome.trim(), descricao: descricao?.trim() || null, valor, ativo };
  const consulta = id
    ? supabase.from('servicos').update(registro).eq('id', id)
    : supabase.from('servicos').insert(registro);
  const { data, error } = await consulta.select().single();
  if (error) {
    if (error.code === '23505') throw new ErroNegocio('NOME_DUPLICADO', 'Já existe um serviço com este nome.');
    throw error;
  }
  return data;
}
