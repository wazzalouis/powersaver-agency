/**
 * Fusion Students — Brand Configuration
 * SINGLE SOURCE OF TRUTH for all styling across the Energy Intelligence Platform.
 *
 * Extracted from https://www.fusionstudents.co.uk/ on 2 March 2026.
 * Typography: Rotonto (display, proprietary), freight-sans-pro (body, Adobe Fonts)
 * Closest Google Font substitutes: DM Serif Display (display), DM Sans (body)
 */

// ─── Colour Palette ──────────────────────────────────────────────────────────

export const colors = {
  /** Core brand */
  primary: {
    DEFAULT: '#37543B',
    light:   '#4A6B4F',
    dark:    '#2B4130',
    50:      '#EEF2EE',
    100:     '#D5DFD6',
    200:     '#ADBFAF',
    300:     '#849F87',
    400:     '#5C7F60',
    500:     '#37543B',
    600:     '#2F4833',
    700:     '#263A29',
    800:     '#1E2D20',
    900:     '#151F17',
  },

  /** Sage / olive accent */
  sage: {
    DEFAULT: '#BCBD89',
    light:   '#D0D1A8',
    dark:    '#A0A16E',
  },

  /** Copper / terracotta */
  copper: {
    DEFAULT: '#A14D3D',
    light:   '#C06B5A',
    dark:    '#7E3A2E',
  },

  /** Warm cream */
  cream: {
    DEFAULT: '#E3E3D9',
    light:   '#F0F0E9',
    dark:    '#D4D4C6',
  },

  /** Neutral palette */
  neutral: {
    50:  '#FAFAF7',
    100: '#F0F0E9',
    200: '#E3E3D9',
    300: '#D4D4C6',
    400: '#A4A4A4',
    500: '#6B6B6B',
    600: '#4E4E4E',
    700: '#333333',
    800: '#181818',
    900: '#0A0A0A',
  },

  /** Semantic colours */
  success:  '#4A7C59',
  warning:  '#D4913B',
  danger:   '#C45B5B',
  info:     '#5B8CA4',

  /** Chart palette — derived from brand, optimised for data visualisation */
  chart: {
    green:     '#37543B',
    sage:      '#BCBD89',
    copper:    '#A14D3D',
    teal:      '#5B8CA4',
    gold:      '#D4913B',
    blush:     '#C45B5B',
    mint:      '#4A7C59',
    lavender:  '#8B7BA4',
  },
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const typography = {
  /** Display / heading font — Rotonto substitute */
  display: {
    family: '"DM Serif Display", Georgia, "Times New Roman", serif',
    google: 'DM+Serif+Display:wght@400',
  },
  /** Body / UI font — freight-sans-pro substitute */
  body: {
    family: '"DM Sans", "Century Gothic", Calibri, Arial, sans-serif',
    google: 'DM+Sans:wght@300;400;500;600;700',
  },
  /** Monospace for data */
  mono: {
    family: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
    google: 'JetBrains+Mono:wght@400;500;600',
  },
  /** Size scale */
  size: {
    xs:   '0.75rem',   // 12px
    sm:   '0.875rem',  // 14px
    base: '1rem',      // 16px
    lg:   '1.125rem',  // 18px
    xl:   '1.25rem',   // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  /** Font weights */
  weight: {
    light:    300,
    normal:   400,
    medium:   500,
    semibold: 600,
    bold:     700,
  },
  /** Line heights */
  lineHeight: {
    tight:  1.2,
    snug:   1.35,
    normal: 1.5,
    relaxed: 1.625,
    loose:  2,
  },
} as const;

// ─── Spacing ────────────────────────────────────────────────────────────────

export const spacing = {
  0:  '0px',
  1:  '4px',
  2:  '8px',
  3:  '12px',
  4:  '16px',
  6:  '24px',
  8:  '32px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
} as const;

// ─── Radius ─────────────────────────────────────────────────────────────────

export const radius = {
  none: '0px',
  sm:   '6px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  full: '9999px',
} as const;

// ─── Shadows (warm green-tinted) ────────────────────────────────────────────

export const shadows = {
  sm:   '0 1px 2px rgba(55, 84, 59, 0.05)',
  md:   '0 4px 6px rgba(55, 84, 59, 0.07)',
  lg:   '0 10px 15px rgba(55, 84, 59, 0.10)',
  xl:   '0 20px 25px rgba(55, 84, 59, 0.12)',
  glow: '0 0 20px rgba(188, 189, 137, 0.15)',
} as const;

// ─── Transitions ────────────────────────────────────────────────────────────

export const transitions = {
  duration: {
    fast:   '150ms',
    normal: '250ms',
    slow:   '400ms',
  },
  timing: {
    ease:      'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
    easeIn:    'cubic-bezier(0.4, 0, 1, 1)',
    easeOut:   'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring:    'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

// ─── Breakpoints ────────────────────────────────────────────────────────────

export const breakpoints = {
  mobile:  '480px',
  tablet:  '768px',
  desktop: '1024px',
  wide:    '1280px',
} as const;

// ─── Animation (Framer Motion) ──────────────────────────────────────────────

export const animation = {
  duration: {
    fast:   0.15,
    normal: 0.3,
    slow:   0.5,
  },
  easing: {
    default: [0.25, 0.1, 0.25, 1.0],
    spring:  { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
} as const;

// ─── Chart-specific palettes ────────────────────────────────────────────────

export const chartPalettes = {
  /** Default 8-colour sequence for general charts */
  default: [
    colors.chart.green,
    colors.chart.sage,
    colors.chart.copper,
    colors.chart.teal,
    colors.chart.gold,
    colors.chart.blush,
    colors.chart.mint,
    colors.chart.lavender,
  ],
  /** Energy type breakdown: grid vs solar vs battery */
  energy: [
    colors.chart.green,   // grid
    colors.chart.gold,    // solar
    colors.chart.teal,    // battery
  ],
  /** Status: operational / warning / critical */
  status: [
    colors.success,
    colors.warning,
    colors.danger,
  ],
  /** Comparison: this period vs last period */
  comparison: [
    colors.primary.DEFAULT,
    colors.cream.dark,
  ],
} as const;

// ─── CSS Custom Properties ──────────────────────────────────────────────────

export const cssVariables = {
  '--fusion-primary':       colors.primary.DEFAULT,
  '--fusion-primary-light': colors.primary.light,
  '--fusion-primary-dark':  colors.primary.dark,
  '--fusion-sage':          colors.sage.DEFAULT,
  '--fusion-sage-light':    colors.sage.light,
  '--fusion-copper':        colors.copper.DEFAULT,
  '--fusion-copper-light':  colors.copper.light,
  '--fusion-cream':         colors.cream.DEFAULT,
  '--fusion-cream-light':   colors.cream.light,
  '--fusion-cream-dark':    colors.cream.dark,
  '--fusion-surface':       colors.neutral[50],
  '--fusion-text':          colors.neutral[900],
  '--fusion-text-secondary': colors.neutral[500],
  '--fusion-text-muted':    colors.neutral[400],
  '--fusion-success':       colors.success,
  '--fusion-warning':       colors.warning,
  '--fusion-danger':        colors.danger,
  '--fusion-info':          colors.info,
  '--fusion-radius':        radius.md,
  '--fusion-font-display':  typography.display.family,
  '--fusion-font-body':     typography.body.family,
  '--fusion-font-mono':     typography.mono.family,
} as const;

// ─── Site Locations ──────────────────────────────────────────────────────────

export const fusionLocations = [
  { id: 'brent-cross',  name: 'Brent Cross Town', city: 'London',     status: 'operational' as const, units: 434 },
  { id: 'liverpool',    name: 'Liverpool',        city: 'Liverpool',   status: 'operational' as const, units: 382 },
  { id: 'nottingham',   name: 'Nottingham',       city: 'Nottingham',  status: 'operational' as const, units: 512 },
  { id: 'york',         name: 'York',             city: 'York',        status: 'operational' as const, units: 298 },
  { id: 'leeds',        name: 'Leeds',            city: 'Leeds',       status: 'opening-2026' as const, units: 450 },
  { id: 'manchester',   name: 'Manchester',       city: 'Manchester',  status: 'opening-2026' as const, units: 520 },
] as const;
