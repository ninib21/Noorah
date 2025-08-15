// NannyRadar App Theme Configuration
export const theme = {
  colors: {
    // Primary Colors
    primary: '#FF69B4',        // Hot Pink
    primaryLight: '#FFB6C1',   // Light Pink
    primaryDark: '#C71585',    // Medium Violet Red
    
    // Secondary Colors
    secondary: '#87CEEB',      // Sky Blue
    secondaryLight: '#B0E0E6', // Powder Blue
    secondaryDark: '#4682B4',  // Steel Blue
    
    // Neutral Colors
    white: '#FFFFFF',
    background: '#FAFAFA',     // Off White
    surface: '#FFFFFF',
    
    // Text Colors
    textPrimary: '#2C3E50',    // Dark Blue Gray
    textSecondary: '#7F8C8D',  // Medium Gray
    textLight: '#BDC3C7',      // Light Gray
    
    // Status Colors
    success: '#2ECC71',        // Green
    warning: '#F39C12',        // Orange
    error: '#E74C3C',          // Red
    info: '#3498DB',           // Blue
    
    // Gradient Colors
    gradientPink: ['#FF69B4', '#FFB6C1'],
    gradientBlue: ['#87CEEB', '#B0E0E6'],
    gradientMixed: ['#FF69B4', '#87CEEB'],
  },
  
  typography: {
    fontFamily: {
      primary: 'Nunito',
      secondary: 'Poppins',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
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
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  animations: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeInOut: 'ease-in-out',
      easeOut: 'ease-out',
      spring: 'spring',
    },
  },
};
