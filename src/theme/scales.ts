// Raw, scheme-independent scale values a default theme is authored from; the
// contract turns them into CSS variables. Typography, spacing, radius etc.
// don't change between light/dark, so they live here and are reused by both.

// The font-size scale is an anchor (the `md` step) plus two linear increments
// — `lower` spans `xs`→`xl`, `upper` spans `xl`→`9xl` — derived per-size at
// token-build time (see `defaultTokens`). Reproduces Tailwind's font-sizes
// exactly for `xs`–`2xl`, then grows linearly.
export const fontSizeAnchor = "1rem"; // md
export const fontStep = {
  lower: "0.125rem", // xs → xl step
  upper: "0.25rem", // xl → 9xl step
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  superbold: "800",
} as const;

// Letter-spacing (tracking) scale, `em`-based so a step tracks font-size
// proportionally (0.05em reads the same at `xs` and `9xl`). Reproduces
// Tailwind's tracking scale; `widest` (0.1em) suits small uppercase labels.
export const letterSpacing = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
} as const;

// Named line-height (leading) scale — unitless multipliers reproducing
// Tailwind's `leading-*` steps, so a step scales with font-size. The
// standalone `lineHeight` prop's vocabulary; distinct from the per-size scale below.
export const leading = {
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2",
} as const;

// Per-size line-heights, defaulting to Tailwind's values. Small–display sizes
// use an absolute length; the largest sizes use a unitless `1`.
export const lineHeight = {
  xs: "1rem",
  sm: "1.25rem",
  md: "1.5rem",
  lg: "1.75rem",
  xl: "1.75rem",
  "2xl": "2rem",
  "3xl": "2.25rem",
  "4xl": "2.5rem",
  "5xl": "1",
  "6xl": "1",
  "7xl": "1",
  "8xl": "1",
  "9xl": "1",
} as const;

export const space = {
  "0": "0",
  "1": "4px",
  "2": "8px",
  "3": "12px",
  "4": "16px",
  "6": "24px",
  "8": "32px",
  "12": "48px",
  "16": "64px",
} as const;

export const radius = {
  none: "0",
  sm: "4px",
  md: "8px",
  lg: "16px",
  full: "9999px",
} as const;

export const borderWidth = {
  thin: "1px",
  thick: "2px",
} as const;

export const fontFamily = {
  sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
} as const;

export const motion = {
  duration: {
    fast: "120ms",
    base: "200ms",
    slow: "320ms",
  },
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
  },
} as const;
