import { TEXT_SIZES, type TextSize } from "./constants";
import { vars } from "./contract.css";

/**
 * The consumer-defined font-size vocabulary — an *open* vocabulary mirroring
 * the `font` one in {@link module:./fonts}.
 *
 * The built-in ramp (`xs`…`9xl`) is closed and token-backed. A brand's custom
 * sizes only exist at *its* build/runtime, so this open half can't ride the
 * vanilla-extract contract — instead it's a naming convention
 * (`--fontSize-<name>` custom properties published by the theme) plus this
 * augmentable type seam.
 *
 * `FontSizeRegistry` ships empty, so `size` starts as a loose `string` until an
 * app augments it with its own names. Those names must match the `sizes` option
 * handed to the theme ({@link createDesignSystemTheme} / {@link createInlineTheme}
 * / `BaritoneTheme`), which emits one `--fontSize-<name>` per entry (built-ins
 * are always emitted).
 *
 * A consumer size is a bare `font-size` (line-height defaults to `md`) or a
 * `{ fontSize, lineHeight }` pair with its own paired default leading,
 * Tailwind-style. The `lineHeight` prop overrides either.
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
 * A consumer-defined size value: a bare `font-size` string, or a
 * `{ fontSize, lineHeight }` pair whose `lineHeight` becomes the size's paired
 * default leading (the `lineHeight` prop still overrides). Mirrors Tailwind's
 * `fontSize` scale.
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
 * The CSS custom property holding the `font-size` for a given `name` — the
 * contract between the theme (publishes it) and the `size` prop (reads it via
 * `var(...)`). Mirrors {@link fontVarName}.
 */
export function fontSizeVarName(name: string): string {
  return `--fontSize-${name}`;
}

/**
 * The CSS custom property holding a size's *paired* line-height — the default
 * leading `size` applies when `lineHeight` is unset. A distinct namespace from
 * {@link lineHeightVarName}'s `--lineHeight-<name>` so the two vocabularies
 * never collide on a shared name.
 */
export function sizeLineHeightVarName(name: string): string {
  return `--sizeLineHeight-${name}`;
}

/**
 * The custom properties the *size vocabulary* publishes: each `--fontSize-<name>`
 * plus its paired `--sizeLineHeight-<name>` (a size is a font-size + leading pair,
 * like the `text.size` tokens). The built-in ramp (`xs`…`9xl`) routes through the
 * contract vars so a runtime theme/brand swap still flows through. Spread into a
 * theme class's `vars` (build time) or a `style` object (runtime). (The standalone
 * leading scale is a separate `--lineHeight-<name>` namespace — see
 * {@link lineHeightVars} — so a consumer size and a standalone leading can share a
 * name without colliding.)
 *
 * Built-in size names are reserved — entries by those names in `sizes` are
 * ignored. Customise the built-in ramp through the theme tokens
 * (`BrandSeed.fontScale`) instead.
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
    // The built-in sizes stay token-backed (`vars.text.size.*`) so bare text and
    // `size="lg"` never diverge; the registry can't shadow them.
    if ((TEXT_SIZES as readonly string[]).includes(name)) continue;
    if (typeof value === "string") {
      out[fontSizeVarName(name)] = value;
    } else {
      out[fontSizeVarName(name)] = value.fontSize;
      // A bundled `lineHeight` becomes the size's paired default; without one
      // it falls back to `md`.
      if (value.lineHeight !== undefined) out[sizeLineHeightVarName(name)] = value.lineHeight;
    }
  }
  return out;
}
