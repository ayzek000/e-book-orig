/**
 * Modern Design System for E-book Creation App - 2025 Edition
 * 
 * This file contains design tokens and theme configuration
 * for a consistent, modern UI/UX experience.
 */

export const colors = {
  // Primary palette - Vibrant purple with electric accents
  primary: {
    50: '#F3E8FF',
    100: '#E9D5FF',
    200: '#D8B4FE',
    300: '#C084FC',
    400: '#A855F7',
    500: '#9333EA', // Primary color
    600: '#7E22CE',
    700: '#6B21A8',
    800: '#581C87',
    900: '#4C1D95',
    950: '#2E1065',
  },
  
  // Secondary palette - Electric cyan for vibrant accents
  secondary: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4', // Secondary color
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
    950: '#083344',
  },
  
  // Accent palette - Vibrant pink for highlights
  accent: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899', // Accent color
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
    950: '#500724',
  },
  
  // Neutral palette - Cool dark grays for text and backgrounds
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
  
  // Semantic colors - More vibrant versions
  success: '#10B981', // Green
  warning: '#F59E0B', // Amber
  error: '#EF4444',   // Red
  info: '#3B82F6',    // Blue
  danger: '#E11D48',  // Rose red
  
  // Special UI elements - Darker themes
  background: {
    light: '#F8FAFC',     // Very light slate
    dark: '#0F172A',      // Very dark slate
    subtle: '#1E293B',    // Dark slate for cards in dark mode
    muted: '#334155',     // Medium slate for secondary elements
    canvas: '#020617',    // Almost black for main background in dark mode
  },
  
  // Gradient presets - More vibrant and colorful
  gradients: {
    primary: 'linear-gradient(135deg, #9333EA 0%, #6B21A8 100%)',
    secondary: 'linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)',
    accent: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
    vibrant: 'linear-gradient(135deg, #9333EA 0%, #EC4899 50%, #06B6D4 100%)',
    neon: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #06B6D4 100%)',
    glow: 'linear-gradient(135deg, rgba(147, 51, 234, 0.5) 0%, rgba(236, 72, 153, 0.3) 100%)',
    dark: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
  },
};

export const typography = {
  fontFamily: {
    sans: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

export const spacing = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem',     // 384px
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
  '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.35)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
  none: 'none',
  
  // Vibrant 2025 shadows with colored glow effects
  glow: {
    primary: '0 4px 20px -2px rgba(147, 51, 234, 0.35)', // Purple
    secondary: '0 4px 20px -2px rgba(6, 182, 212, 0.35)', // Cyan
    accent: '0 4px 20px -2px rgba(236, 72, 153, 0.35)',   // Pink
    success: '0 4px 20px -2px rgba(16, 185, 129, 0.35)',  // Green
    warning: '0 4px 20px -2px rgba(245, 158, 11, 0.35)',  // Amber
    danger: '0 4px 20px -2px rgba(225, 29, 72, 0.35)',    // Rose
    neutral: '0 4px 20px -2px rgba(30, 41, 59, 0.35)',    // Slate
  },
  
  // Neon glow effects
  neon: {
    primary: '0 0 5px rgba(147, 51, 234, 0.5), 0 0 20px rgba(147, 51, 234, 0.3)',
    secondary: '0 0 5px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)',
    accent: '0 0 5px rgba(236, 72, 153, 0.5), 0 0 20px rgba(236, 72, 153, 0.3)',
    multi: '0 0 10px rgba(147, 51, 234, 0.4), 0 0 20px rgba(236, 72, 153, 0.3), 0 0 30px rgba(6, 182, 212, 0.2)',
  },
  
  // Glass effect shadows
  glass: {
    light: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    dark: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  },
  
  // Dark mode specific shadows
  dark: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.5), 0 1px 2px 0 rgba(0, 0, 0, 0.4)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
  },
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
};

export const transitions = {
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  timing: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Vibrant 2025 UI component styles
export const componentStyles = {
  button: {
    primary: {
      base: `
        inline-flex items-center justify-center px-4 py-2
        bg-primary-500 text-white font-medium
        rounded-xl transition-all duration-200
        hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
        shadow-neon-primary hover:shadow-lg active:shadow-sm
        transform hover:-translate-y-0.5 active:translate-y-0
      `,
      sizes: {
        sm: 'text-sm px-3 py-1.5 rounded-lg',
        md: 'text-base px-4 py-2 rounded-xl',
        lg: 'text-lg px-5 py-2.5 rounded-2xl',
      },
      variants: {
        outline: `
          bg-transparent border-2 border-primary-500 text-primary-500
          hover:bg-primary-500/10 hover:text-primary-400 hover:border-primary-400
          dark:text-primary-400 dark:border-primary-400 dark:hover:bg-primary-500/20
        `,
        ghost: `
          bg-transparent text-primary-500
          hover:bg-primary-500/10 hover:text-primary-400
          shadow-none hover:shadow-none
          dark:text-primary-400 dark:hover:bg-primary-500/20
        `,
        soft: `
          bg-primary-100 text-primary-800
          hover:bg-primary-200 hover:text-primary-900
          shadow-none hover:shadow-sm
          dark:bg-primary-900/50 dark:text-primary-300 dark:hover:bg-primary-800/70
        `,
        gradient: `
          bg-gradient-to-r from-primary-500 to-accent-500 text-white
          hover:from-primary-600 hover:to-accent-600
          shadow-neon-multi hover:shadow-lg
        `,
        neon: `
          bg-black border-2 border-primary-500 text-primary-400
          hover:border-primary-400 hover:text-primary-300
          shadow-neon-primary hover:shadow-neon-primary
          dark:bg-neutral-900
        `,
      },
    },
    secondary: {
      base: `
        inline-flex items-center justify-center px-4 py-2
        bg-secondary-500 text-white font-medium
        rounded-lg transition-all duration-200
        hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2
        shadow-md hover:shadow-lg active:shadow-sm
      `,
    },
  },
  card: {
    base: `
      bg-white rounded-xl overflow-hidden
      transition-all duration-200
      border border-neutral-200
    `,
    variants: {
      elevated: 'shadow-lg hover:shadow-xl',
      flat: 'shadow-none',
      outline: 'border border-neutral-200 shadow-none',
      glass: `
        backdrop-filter backdrop-blur-lg bg-white/70
        border border-white/20 shadow-lg
      `,
    },
  },
  input: {
    base: `
      w-full px-4 py-2 rounded-lg
      border border-neutral-300
      bg-white text-neutral-900
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
      placeholder:text-neutral-400
    `,
    sizes: {
      sm: 'text-sm px-3 py-1.5 rounded-md',
      md: 'text-base px-4 py-2 rounded-lg',
      lg: 'text-lg px-5 py-2.5 rounded-xl',
    },
    states: {
      error: 'border-error focus:ring-error focus:border-error',
      success: 'border-success focus:ring-success focus:border-success',
    },
  },
};

// Modern 2025 UI effects
export const effects = {
  glassmorphism: 'backdrop-filter backdrop-blur-lg bg-white/70 border border-white/20',
  neumorphism: 'bg-neutral-100 shadow-neumorphic-flat active:shadow-neumorphic-pressed',
  glow: 'relative after:absolute after:inset-0 after:bg-gradients-glow after:opacity-0 after:transition-opacity hover:after:opacity-100',
};

// Export the complete design system
export const designSystem = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  transitions,
  componentStyles,
  effects,
};

export default designSystem;
