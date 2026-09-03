import { vars } from "./contract.css";

/**
 * The consumer-defined font vocabulary — the one *open* vocabulary in Baritone.
 *
 * Everything else (`INTENTS`, `TEXT_SIZES`, `TEXT_WEIGHTS`, …) is a closed tuple
 * baked into the theme contract at compile time, but a font family only exists
 * at the *app's* build/runtime — so `font` rides a naming convention
 * (`--font-<name>` custom properties) plus this augmentable type seam instead.
 *
 * Baritone ships `FontRegistry` empty, so `font` starts as a loose `string`. An
 * app augments the interface to declare its own names, tightening `font` to
 * `sans | mono | <their names>` with autocompletion.
 *
 * Declared names must line up with the families handed to the theme (the
 * `fonts` option on {@link createDesignSystemTheme} / {@link createInlineTheme} /
 * `BaritoneTheme`), which emits one `--font-<name>` per entry. `sans`/`mono` are
 * always emitted, so need no registry entry.
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
 * The names accepted by the `font` prop on `Text`/`Heading`; a loose `string`
 * until a consumer augments {@link FontRegistry}, then the built-ins plus their declared names.
 */
export type FontName = keyof FontRegistry extends never
  ? string
  : BuiltinFontName | (keyof FontRegistry & string);

/**
 * The CSS custom property holding the family for a given font `name` — the
 * contract between the theme's `--font-<name>` and the component's `var(--font-<name>)` read.
 */
export function fontVarName(name: string): string {
  return `--font-${name}`;
}

/**
 * The `--font-<name>` custom properties a theme publishes: built-in `sans`/`mono`
 * (routed through the contract vars for runtime theme swaps) plus one entry per
 * consumer-supplied family. Spread into a theme class's `vars` (build time) or a
 * `style` object (runtime).
 *
 * `sans`/`mono` are reserved: entries by those names in `fonts` are ignored (they
 * stay token-backed). Change the built-ins via the theme tokens instead.
 */
export function fontFamilyVars(fonts: Record<string, string> = {}): Record<string, string> {
  const out: Record<string, string> = {
    [fontVarName("sans")]: vars.font.sans,
    [fontVarName("mono")]: vars.font.mono,
  };
  for (const [name, family] of Object.entries(fonts)) {
    // `sans`/`mono` are always token-backed so bare text and `font="sans"` never
    // diverge; the registry can't shadow them. Customise via the theme tokens (`brand.fonts`).
    if (name === "sans" || name === "mono") continue;
    out[fontVarName(name)] = family;
  }
  return out;
}
