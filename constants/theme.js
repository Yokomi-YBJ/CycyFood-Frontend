// constants/theme.js
export const COLORS = {
  // Couleurs principales
  primary:    '#FF6B35',   // Orange chaud – identité LaTchop
  secondary:  '#2196F3',   // Bleu info
  accent:     '#FFC107',   // Jaune doré

  // Statuts
  success:    '#27AE60',
  error:      '#E74C3C',
  warning:    '#F39C12',
  info:       '#2196F3',

  // Surfaces
  background: '#F7F7F8',
  surface:    '#FFFFFF',
  border:     '#EBEBEB',

  // Texte
  text: {
    primary:   '#1A1A2E',
    secondary: '#6B7280',
    disabled:  '#BDBDBD',
    inverse:   '#FFFFFF',
  },
};

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
};

export const RADIUS = {
  sm:   6,
  md:   12,
  lg:   16,
  xl:   24,
  full: 999,
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const TYPOGRAPHY = {
  h1:      { fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  h2:      { fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  h3:      { fontSize: 20, fontWeight: '700' },
  h4:      { fontSize: 17, fontWeight: '700' },
  body:    { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 17 },
  label:   { fontSize: 13, fontWeight: '700' },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
};
