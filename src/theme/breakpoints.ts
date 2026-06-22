// Breakpoints are intentionally NOT part of the theme contract: CSS custom
// properties cannot be used inside `@media` query conditions, so these must be
// static literals. Sprinkles consumes them to build responsive conditions.
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

export type Breakpoint = keyof typeof breakpoints;
