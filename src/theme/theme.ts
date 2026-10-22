/**
 * Paleta da identidade visual Stock4event:
 * azul-marinho #092D5E (fundo do ícone), azul-escuro #011C46 (texto do logo) e âmbar #FFAD19.
 * Logos em src/assets/brand (componente BrandLogo).
 */
export const COLORS = {
  primaryYellow: '#FFAD19',
  primaryGold: '#FFAD19',
  cream: '#FFFDF7',
  creamBorder: '#F3E3B1',
  creamSoft: '#FFF6DE',
  goldMuted: '#D4B56A',
  pageBackground: '#FAFAFA',
  primaryBlue: '#2F95DC',
  textWhite: '#FFFFFF',
  textGray: '#606060',
  textDark: '#333333',
  inputBackground: '#FFFFFF',
  footerBackground: '#D9D9D9',
  backgroundtema: ['#FFAD19', '#FAFAFA'] as const,
};

/** Identidade visual das telas operacionais do fornecedor. */
export const COMPANY_COLORS = {
  primary: '#092D5E',
  primaryDark: '#011C46',
  primarySoft: '#EAF1F8',
  primaryBorder: '#C8D8E8',
  primaryMuted: '#53739A',
  pageBackground: '#F6F8FB',
  gradient: ['#092D5E', '#F6F8FB'] as const,
};

/** Identidade visual do fluxo do cliente (mesmo amarelo da área do fornecedor). */
export const CLIENTE_COLORS = {
  primary: '#FFAD19',
  primarySoft: '#FFF6DE',
  brandAccent: '#011C46',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const LAYOUT = {
  formWidth: '82%' as const,
};

export const FONTS = {
  header1: 28,
  header2: 18,
  tagline: 16,
  small: 14,
  button: 18,
};
