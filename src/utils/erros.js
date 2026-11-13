// Erro de regra de negócio (diferente de falha técnica/rede)
export class ErroNegocio extends Error {
  constructor(codigo, mensagem) {
    super(mensagem);
    this.name = 'ErroNegocio';
    this.codigo = codigo;
  }
}

export function mensagemDeErro(e) {
  if (e instanceof ErroNegocio) return e.message;
  const msg = e?.message || '';
  if (msg.includes('AGENDAMENTO_JA_CONCLUIDO')) return 'Este agendamento já foi concluído e não pode ser reaberto.';
  if (msg.includes('Bucket not found')) return 'O bucket "animais" não existe no Supabase Storage. Rode o SQL de storage (veja o README).';
  if (msg.includes('row-level security')) return 'Sem permissão para esta operação. Confira se você está logado e se as policies do Supabase foram criadas.';
  return msg || 'Ocorreu um erro inesperado. Tente novamente.';
}

export function mensagemDeAuth(e) {
  const msg = (e?.message || '').toLowerCase();
  if (msg.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (msg.includes('email not confirmed')) return 'Confirme seu e-mail pelo link enviado antes de entrar.';
  if (msg.includes('already registered')) return 'Este e-mail já está cadastrado. Volte e faça login.';
  if (msg.includes('at least 6')) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (msg.includes('rate limit')) return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
  return e?.message || 'Não foi possível concluir. Tente novamente.';
}
