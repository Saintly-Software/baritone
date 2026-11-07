import { vars } from "./contract.css";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface FontRegistry {}

export type BuiltinFontName = "sans" | "mono";

export type FontName = keyof FontRegistry extends never
  ? string
  : BuiltinFontName | (keyof FontRegistry & string);

export function fontVarName(name: string): string {
  return `--font-${name}`;
}

export function fontFamilyVars(fonts: Record<string, string> = {}): Record<string, string> {
  const out: Record<string, string> = {
    [fontVarName("sans")]: vars.font.sans,
    [fontVarName("mono")]: vars.font.mono,
  };
  for (const [name, family] of Object.entries(fonts)) {
    if (name === "sans" || name === "mono") continue;
    out[fontVarName(name)] = family;
  }
  return out;
}
