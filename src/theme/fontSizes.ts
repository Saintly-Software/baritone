import { TEXT_SIZES, type TextSize } from "./constants";
import { vars } from "./contract.css";

/**
 * The consumer-defined font-size vocabulary — an *open* vocabulary mirroring
 * `font`. The built-in ramp (`xs`…`9xl`) is a closed, token-backed scale, but a
 * brand may want sizes outside it that only exist at its build/runtime, so the
 * open half rides a naming convention (`--fontSize-<name>`) plus this augmentable
 * type seam rather than the vanilla-extract contract.
 *
 * Shipped empty, so `size` starts as a loose `string`; an app augments the
 * interface to tighten it to the built-ins plus its declared names. The declared
 * names must line up with the `sizes` option handed to the theme.
 *
 * @example
 * // Somewhere in the consuming app (e.g. a `baritone.d.ts`):
 * declare module "@saintly-software/baritone" {
 *   interface FontSizeRegistry {
 *     hero: true;
 *     figure: true;
 *   }
 * }
 * // Now `<Heading size="hero">` type-checks and autocompletes; `size="huge"` errors.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface FontSizeRegistry {}

/**
 * A consumer-defined size value: a `{ fontSize, lineHeight }` pair whose
 * `lineHeight` becomes the size's paired default leading (overridable by the
 * `lineHeight` prop). Mirrors Tailwind's `fontSize` scale.
 */
export type SizeValue = { fontSize: string; lineHeight?: string };

/** The size names Baritone always publishes, independent of the registry. */
export type BuiltinFontSizeName = TextSize;

/**
 * The names accepted by the `size` prop on `Text`/`Heading`. Resolves to a loose
 * `string` until a consumer augments {@link FontSizeRegistry}, then tightens to
 * the built-ins plus their declared names.
 */
export type FontSizeName = keyof FontSizeRegistry extends never
  ? string
  : BuiltinFontSizeName | (keyof FontSizeRegistry & string);

/**
 * The CSS custom property that holds the `font-size` for a given `name`. This is
 * the contract between the value side (the theme publishes `--fontSize-<name>`)
 * and the component side (the `size` prop reads `var(--fontSize-<name>)`). Mirrors
 * {@link fontVarName}.
 */
export function fontSizeVarName(name: string): string {
  return `--fontSize-${name}`;
}

/**
 * The CSS custom property holding a size's *paired* line-height. A distinct
 * namespace from {@link lineHeightVarName}, so a consumer size and a standalone
 * leading can reuse the same name without colliding.
 */
export function sizeLineHeightVarName(name: string): string {
  return `--sizeLineHeight-${name}`;
}

/**
 * The custom properties the *size vocabulary* publishes — `--fontSize-<name>` and
 * each size's paired `--sizeLineHeight-<name>`. The built-in ramp routes through
 * the contract vars (so a runtime brand swap flows through); each consumer entry
 * adds its own. Spread into a theme class's `vars` (build time) or a `style`
 * object (runtime). Built-in names are reserved — customise the ramp through the
 * theme tokens (`BrandSeed.fontScale`) instead.
 */
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
