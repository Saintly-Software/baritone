import { TEXT_WEIGHTS, type TextWeight } from "./constants";
import { vars } from "./contract.css";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface FontWeightRegistry {}

export type BuiltinFontWeightName = TextWeight;

export type FontWeightName = keyof FontWeightRegistry extends never
  ? string
  : BuiltinFontWeightName | (keyof FontWeightRegistry & string);

export function fontWeightVarName(name: string): string {
  return `--fontWeight-${name}`;
}

export function fontWeightVars(weights: Record<string, string> = {}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const weight of TEXT_WEIGHTS) {
    out[fontWeightVarName(weight)] = vars.text.weight[weight];
  }
  for (const [name, value] of Object.entries(weights)) {
    if ((TEXT_WEIGHTS as readonly string[]).includes(name)) continue;
    out[fontWeightVarName(name)] = value;
  }
  return out;
}
