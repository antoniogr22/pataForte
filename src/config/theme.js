export const cores = {
  primary: '#1F6F5C',
  primaryDark: '#174F42',
  primarySoft: '#E3F0EB',
  primaryBorda: '#A9CDBF',
  pagina: '#E9EEEC',   // fundo do navegador (fora da coluna do "celular")
  bg: '#F6F8F7',       // fundo da coluna
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#1A2433',
  muted: '#64748B',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  warn: '#B45309',
  warnSoft: '#FEF3C7',
  success: '#166534',
  successSoft: '#DCFCE7',
};

export const espaco = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const raio = { sm: 10, md: 14, lg: 18 };

// Sombra multiplataforma
export const sombra = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

// Limita o layout em telas grandes (simula um celular no meio do PC)
export const LARGURA_MAX = 640;
