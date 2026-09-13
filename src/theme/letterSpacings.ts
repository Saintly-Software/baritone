import { LETTER_SPACING_KEYS, type LetterSpacingKey } from "./constants";
import { vars } from "./contract.css";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface LetterSpacingRegistry {}

export type BuiltinLetterSpacingName = LetterSpacingKey;

export type LetterSpacingName = keyof LetterSpacingRegistry extends never
  ? string
  : BuiltinLetterSpacingName | (keyof LetterSpacingRegistry & string);

export function letterSpacingVarName(name: string): string {
  return `--letterSpacing-${name}`;
}

export function letterSpacingVars(
  letterSpacings: Record<string, string> = {},
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of LETTER_SPACING_KEYS) {
    out[letterSpacingVarName(key)] = vars.text.letterSpacing[key];
  }
  for (const [name, value] of Object.entries(letterSpacings)) {
    if ((LETTER_SPACING_KEYS as readonly string[]).includes(name)) continue;
    out[letterSpacingVarName(name)] = value;
  }
  return out;
}
