import { LINE_HEIGHT_KEYS, type LineHeightKey } from "./constants";
import { vars } from "./contract.css";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface LineHeightRegistry {}

export type BuiltinLineHeightName = LineHeightKey;

export type LineHeightName = keyof LineHeightRegistry extends never
  ? string
  : BuiltinLineHeightName | (keyof LineHeightRegistry & string);

export function lineHeightVarName(name: string): string {
  return `--lineHeight-${name}`;
}

export function lineHeightVars(lineHeights: Record<string, string> = {}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of LINE_HEIGHT_KEYS) {
    out[lineHeightVarName(key)] = vars.text.lineHeight[key];
  }
  for (const [name, value] of Object.entries(lineHeights)) {
    if ((LINE_HEIGHT_KEYS as readonly string[]).includes(name)) continue;
    out[lineHeightVarName(name)] = value;
  }
  return out;
}
