const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const pad = (n) => String(n).padStart(2, '0');

// Data local no formato YYYY-MM-DD (evita o desvio de fuso do toISOString)
export function paraISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function proximosDias(qtd = 14) {
  const hoje = new Date();
  return Array.from({ length: qtd }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);
    return { iso: paraISO(d), semana: DIAS_SEMANA[d.getDay()], dia: pad(d.getDate()), mes: pad(d.getMonth() + 1) };
  });
}

// Gera slots 'HH:MM' de inicio até fim (exclusivo), a cada `passoMin` minutos
export function gerarHorarios(inicio = '08:00', fim = '18:00', passoMin = 30) {
  const [hi, mi] = inicio.split(':').map(Number);
  const [hf, mf] = fim.split(':').map(Number);
  const slots = [];
  for (let t = hi * 60 + mi; t < hf * 60 + mf; t += passoMin) {
    slots.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  }
  return slots;
}

export const HORARIOS = gerarHorarios();

// O Postgres devolve time como '09:00:00'; o app trabalha com 'HH:MM'
export const normalizarHorario = (h) => (h ? String(h).slice(0, 5) : h);

export function formatarDataBR(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`;
}

// Converte "50", "50,5", "1.250,90" ou "50.5" em número (NaN se inválido)
export function parseValor(texto) {
  const t = String(texto ?? '').trim();
  if (!t) return NaN;
  const n = t.includes(',') ? Number(t.replace(/\./g, '').replace(',', '.')) : Number(t);
  return Number.isFinite(n) ? n : NaN;
}

// Horário de hoje que já passou não pode ser agendado
export function horarioJaPassou(dataISO, horario, agora = new Date()) {
  if (dataISO !== paraISO(agora)) return false;
  return horario <= `${pad(agora.getHours())}:${pad(agora.getMinutes())}`;
}
