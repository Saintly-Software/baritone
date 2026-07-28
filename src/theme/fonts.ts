import { vars } from "./contract.css";

/**
 * The consumer-defined font vocabulary — the one *open* vocabulary in Baritone.
 *
 * Everything else (`INTENTS`, `TEXT_SIZES`, `TEXT_WEIGHTS`, …) is a closed tuple
 * baked into the theme contract when Baritone compiles. Fonts are different: the
 * set of families an app wants only exists at *its* build/runtime, after Baritone
 * is already compiled. So `font` can't ride the vanilla-extract contract; instead
 * it's a naming convention (`--font-<name>` custom properties, published by the
 * theme) plus this augmentable type seam.
 *
 * Baritone ships `FontRegistry` empty, so the `font` prop starts as a loose
 * `string`. An app declares its own names by augmenting the interface, which
 * tightens `font` to `sans | mono | <their names>` with autocompletion — while
 * Baritone stays ignorant of what those names are.
 *
 * The declared names must line up with the families handed to the theme (the
 * `fonts` option on {@link createDesignSystemTheme} / {@link createInlineTheme} /
 * `BaritoneTheme`), which emits one `--font-<name>` per entry. The built-in
 * `sans` and `mono` are always emitted, so they need no registry entry.
 *
 * @example
 * // Somewhere in the consuming app (e.g. a `baritone.d.ts`):
 * declare module "@saintly-software/baritone" {
 *   interface FontRegistry {
 *     display: true;
 *     handwriting: true;
 *   }
 * }
 * // Now `<Text font="display">` type-checks and autocompletes; `font="typo"` errors.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface FontRegistry {}

/** The font names Baritone always publishes, independent of the registry. */
export type BuiltinFontName = "sans" | "mono";

/**
 * The names accepted by the `font` prop on `Text`/`Heading`. Resolves to a loose
 * `string` until a consumer augments {@link FontRegistry}, then tightens to the
 * built-ins plus their declared names.
 */
export type FontName = keyof FontRegistry extends never
  ? string
  : BuiltinFontName | (keyof FontRegistry & string);

/**
 * The CSS custom property that holds the family for a given font `name`. This is
 * the contract between the value side (the theme publishes `--font-<name>`) and
 * the component side (the `font` prop reads `var(--font-<name>)`).
 */
export function fontVarName(name: string): string {
  return `--font-${name}`;
}

/**
 * The `--font-<name>` custom properties a theme publishes: the built-in `sans`
 * and `mono` — routed through the contract vars so a runtime theme/brand swap
 * still flows through — plus one entry per consumer-supplied family. Spread into
 * a theme class's `vars` (build time) or a `style` object (runtime).
 *
 * `sans`/`mono` are reserved: entries by those names in `fonts` are ignored (they
 * stay token-backed). Change the built-in families via the theme tokens instead.
 */
export function fontFamilyVars(fonts: Record<string, string> = {}): Record<string, string> {
  const out: Record<string, string> = {
    [fontVarName("sans")]: vars.font.sans,
    [fontVarName("mono")]: vars.font.mono,
  };
  for (const [name, family] of Object.entries(fonts)) {
    // `sans`/`mono` are always token-backed (`vars.font.*`) so bare text and
    // `font="sans"` never diverge; the registry can't shadow them. Customise the
    // built-in families through the theme tokens (`brand.fonts`) instead.
    if (name === "sans" || name === "mono") continue;
    out[fontVarName(name)] = family;
  }
  return out;
}
