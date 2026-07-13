// Raw, scheme-independent scale values. These are the numbers a default theme
// is authored from; the contract turns them into CSS variables. Typography,
// spacing, radius etc. do not change between light/dark, so they live here and
// are reused by both schemes in the default theme.

export const fontSize = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "3.5xl": "2rem",
  "4xl": "2.25rem",
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  superbold: "800",
} as const;

export const lineHeight = {
  tight: "1.2",
  normal: "1.5",
  relaxed: "1.7",
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
