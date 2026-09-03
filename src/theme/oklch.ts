import { vars } from "./contract.css";

// Interaction-state deltas applied in oklch space — hover is a small nudge,
// active is double; sign comes from `--oklch-operator` (per theme/scheme).
export const HOVER_DELTA = { l: 0.02, c: 0.01 } as const;
export const ACTIVE_DELTA = { l: 0.04, c: 0.02 } as const;

/**
 * Build a CSS relative-colour expression that shifts a base colour's lightness
 * and chroma by the deltas × `oklchOperator`; hue is preserved, alpha defaults to the origin's.
 *
 *   oklch(from <base> calc(l + (op) * dl) calc(c + (op) * dc) h)
 *
 * `l` clamps to [0,1] and `c` to >=0 automatically, so extreme shades are safe.
 */
export function shiftColor(
  base: string,
  delta: { l: number; c: number },
  operator: string = vars.oklchOperator,
): string {
  return `oklch(from ${base} calc(l + (${operator}) * ${delta.l}) calc(c + (${operator}) * ${delta.c}) h)`;
}

export const hover = (base: string) => shiftColor(base, HOVER_DELTA);
export const active = (base: string) => shiftColor(base, ACTIVE_DELTA);
