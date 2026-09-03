// Breakpoints are NOT part of the theme contract — CSS custom properties can't be
// used inside `@media` conditions, so these are static literals that Sprinkles consumes for responsive conditions.
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;

export type Breakpoint = keyof typeof breakpoints;
