// Noorah App Theme Configuration (Aurora Neon Edition)
export const theme = {
  colors: {
    // Core palette
    primary: '#7C3AED',
    primaryLight: '#A855F7',
    primaryDark: '#312E81',

    secondary: '#0EA5E9',
    secondaryLight: '#38BDF8',
    secondaryDark: '#075985',

    accent: '#F472B6',
    accentAlt: '#F59E0B',

    white: '#F8FAFC',
    background: '#080524',
    backgroundAlt: '#0F172A',
    surface: 'rgba(15, 23, 42, 0.75)',
    surfaceSolid: '#111827',

    textPrimary: '#E2E8F0',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',

    success: '#22D3EE',
    warning: '#F59E0B',
    error: '#F87171',
    info: '#38BDF8',

    // Gradients
    gradientAurora: ['#312E81', '#7C3AED', '#EC4899'],
    gradientNebula: ['#0EA5E9', '#22D3EE', '#A855F7'],
    gradientSolar: ['#F59E0B', '#FB7185'],
    gradientMidnight: ['#0B1120', '#1E1B4B'],
    gradientGlass: ['rgba(148, 163, 184, 0.08)', 'rgba(148, 163, 184, 0.02)'],
  },

  typography: {
    fontFamily: {
      primary: 'Nunito',
      secondary: 'Poppins',
      display: 'Poppins',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 22,
      '2xl': 26,
      '3xl': 34,
      '4xl': 44,
      display: 52,
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },

  borderRadius: {
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: 'rgba(124, 58, 237, 0.4)',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
    md: {
      shadowColor: 'rgba(14, 165, 233, 0.35)',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 10,
    },
    glow: {
      shadowColor: 'rgba(236, 72, 153, 0.7)',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.7,
      shadowRadius: 30,
      elevation: 12,
    },
  },

  effects: {
    glassCard: {
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      borderWidth: 1,
      borderColor: 'rgba(148, 163, 184, 0.2)',
    },
    neonBorder: {
      borderWidth: 1,
      borderColor: 'rgba(124, 58, 237, 0.6)',
      shadowColor: 'rgba(124, 58, 237, 0.6)',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 18,
    },
  },

  animations: {
    duration: {
      fast: 180,
      normal: 320,
      slow: 560,
      ultra: 900,
    },
    easing: {
      easeInOut: 'ease-in-out',
      easeOut: 'ease-out',
      spring: 'spring',
    },
  },
} as const;

