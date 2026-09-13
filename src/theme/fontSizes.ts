import { TEXT_SIZES, type TextSize } from "./constants";
import { vars } from "./contract.css";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface FontSizeRegistry {}

export type SizeValue = { fontSize: string; lineHeight?: string };

export type BuiltinFontSizeName = TextSize;

export type FontSizeName = keyof FontSizeRegistry extends never
  ? string
  : BuiltinFontSizeName | (keyof FontSizeRegistry & string);

export function fontSizeVarName(name: string): string {
  return `--fontSize-${name}`;
}

export function sizeLineHeightVarName(name: string): string {
  return `--sizeLineHeight-${name}`;
}

export function fontSizeVars(
  sizes: Record<string, string | SizeValue> = {},
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const size of TEXT_SIZES) {
    out[fontSizeVarName(size)] = vars.text.size[size].fontSize;
    out[sizeLineHeightVarName(size)] = vars.text.size[size].lineHeight;
  }
  for (const [name, value] of Object.entries(sizes)) {
    if ((TEXT_SIZES as readonly string[]).includes(name)) continue;
    if (typeof value === "string") {
      out[fontSizeVarName(name)] = value;
    } else {
      out[fontSizeVarName(name)] = value.fontSize;
      if (value.lineHeight !== undefined) out[sizeLineHeightVarName(name)] = value.lineHeight;
    }
  }
  return out;
}
