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
    DEFAULT: '#37543B',    // Forest green — header, footer, dark sections
    light:   '#4A6B4F',    // Hover / lighter variant
    dark:    '#2B4130',    // Pressed / darker variant
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

  /** Sage / olive accent — highlights, "POSITIVE LIVING" text, arrows, icons */
  sage: {
    DEFAULT: '#BCBD89',
    light:   '#D0D1A8',
    dark:    '#A0A16E',
  },

  /** Copper / terracotta — CTA accent, submit buttons, alerts */
  copper: {
    DEFAULT: '#A14D3D',
    light:   '#C06B5A',
    dark:    '#7E3A2E',
  },

  /** Warm cream — primary background, text-on-dark */
  cream: {
    DEFAULT: '#E3E3D9',
    light:   '#F0F0E9',
    dark:    '#D4D4C6',
  },

  /** Neutral palette */
  neutral: {
    50:  '#FAFAF7',    // Surface white
    100: '#F0F0E9',    // Light cream
    200: '#E3E3D9',    // Warm cream (=cream.DEFAULT)
    300: '#D4D4C6',
    400: '#A4A4A4',    // Muted / placeholder
    500: '#6B6B6B',    // Secondary text
    600: '#4E4E4E',    // Body text alt
    700: '#333333',    // Charcoal
    800: '#181818',    // Dark surface
    900: '#0A0A0A',    // Near black (primary text)
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
  /** Scale (px) */
  size: {
    xs:   '12px',
    sm:   '14px',
    base: '16px',
    lg:   '18px',
    xl:   '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },
} as const;

// ─── Spacing & Radius ────────────────────────────────────────────────────────

export const radius = {
  none: '0px',
  sm:   '4px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  full: '9999px',
} as const;

export const shadows = {
  sm:   '0 1px 2px rgba(55, 84, 59, 0.05)',
  md:   '0 4px 6px rgba(55, 84, 59, 0.07)',
  lg:   '0 10px 15px rgba(55, 84, 59, 0.10)',
  xl:   '0 20px 25px rgba(55, 84, 59, 0.12)',
  glow: '0 0 20px rgba(188, 189, 137, 0.15)',
} as const;

// ─── Animation ───────────────────────────────────────────────────────────────

export const animation = {
  /** Framer Motion defaults — subtle, professional */
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

// ─── Design Tokens (CSS custom properties) ───────────────────────────────────

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
