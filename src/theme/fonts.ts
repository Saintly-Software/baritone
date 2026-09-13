import { vars } from "./contract.css";

/**
 * The consumer-defined font vocabulary — the canonical *open* vocabulary in
 * Baritone (the weight / size / leading / tracking / border-width registries all
 * mirror this one).
 *
 * A closed tuple baked into the theme contract can't express the set of families
 * an app wants, since that only exists at *its* build/runtime. So `font` rides a
 * naming convention (`--font-<name>` custom properties, published by the theme)
 * plus this augmentable type seam instead of the vanilla-extract contract.
 *
 * Shipped empty, so the `font` prop starts as a loose `string`; an app augments
 * the interface to tighten it to `sans | mono | <their names>` with
 * autocompletion. The declared names must line up with the theme's `fonts` option,
 * which emits one `--font-<name>` per entry; `sans` / `mono` are always emitted.
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
    if (name === "sans" || name === "mono") continue;
    out[fontVarName(name)] = family;
  }
  return out;
}
