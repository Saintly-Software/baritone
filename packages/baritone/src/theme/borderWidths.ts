import { BORDER_WIDTH_KEYS, type BorderWidthKey } from "./constants";
import { vars } from "./contract.css";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface BorderWidthRegistry {}

export type BuiltinBorderWidthName = BorderWidthKey;

export type BorderWidthName = keyof BorderWidthRegistry extends never
  ? string
  : BuiltinBorderWidthName | (keyof BorderWidthRegistry & string);

export function borderWidthVarName(name: string): string {
  return `--borderWidth-${name}`;
}

export function borderWidthVars(widths: Record<string, string> = {}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const width of BORDER_WIDTH_KEYS) {
    out[borderWidthVarName(width)] = vars.borderWidth[width];
  }
  for (const [name, value] of Object.entries(widths)) {
    if ((BORDER_WIDTH_KEYS as readonly string[]).includes(name)) continue;
    out[borderWidthVarName(name)] = value;
  }
  return out;
}
