import { LETTER_SPACING_KEYS, type LetterSpacingKey } from "./constants";
import { vars } from "./contract.css";

/**
 * The consumer-defined letter-spacing (tracking) vocabulary — a second *open*
 * vocabulary in Baritone, mirroring the `font` one in {@link module:./fonts}.
 *
 * The built-in steps (`tighter`…`widest`) are a closed, token-backed scale baked
 * into the theme contract. But a brand often wants tracking values outside that
 * ramp — a hand-tuned `em` for an all-caps eyebrow, a display headline's negative
 * track — and the exact set only exists at *its* build/runtime. So, like `font`,
 * the open half can't ride the vanilla-extract contract; it's a naming convention
 * (`--letterSpacing-<name>` custom properties, published by the theme) plus this
 * augmentable type seam.
 *
 * Baritone ships `LetterSpacingRegistry` empty, so the `letterSpacing` prop starts
 * as a loose `string`. An app declares its own names by augmenting the interface,
 * which tightens `letterSpacing` to the built-ins plus their declared names with
 * autocompletion — while Baritone stays ignorant of what those names are.
 *
 * The declared names must line up with the values handed to the theme (the
 * `letterSpacings` option on {@link createDesignSystemTheme} /
 * {@link createInlineTheme} / `BaritoneTheme`), which emits one
 * `--letterSpacing-<name>` per entry. The built-in steps are always emitted, so
 * they need no registry entry.
 *
 * @example
 * // Somewhere in the consuming app (e.g. a `baritone.d.ts`):
 * declare module "@saintly-software/baritone" {
 *   interface LetterSpacingRegistry {
 *     eyebrow: true;
 *     display: true;
 *   }
 * }
 * // Now `<Text letterSpacing="eyebrow">` type-checks and autocompletes;
 * // `letterSpacing="loose"` errors.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface LetterSpacingRegistry {}

/** The tracking names Baritone always publishes, independent of the registry. */
export type BuiltinLetterSpacingName = LetterSpacingKey;

/**
 * The names accepted by the `letterSpacing` prop on `Text`/`Heading`. Resolves to
 * a loose `string` until a consumer augments {@link LetterSpacingRegistry}, then
 * tightens to the built-ins plus their declared names.
 */
export type LetterSpacingName = keyof LetterSpacingRegistry extends never
  ? string
  : BuiltinLetterSpacingName | (keyof LetterSpacingRegistry & string);

/**
 * The CSS custom property that holds the tracking value for a given `name`. This
 * is the contract between the value side (the theme publishes
 * `--letterSpacing-<name>`) and the component side (the `letterSpacing` prop reads
 * `var(--letterSpacing-<name>)`). Mirrors {@link fontVarName}.
 */
export function letterSpacingVarName(name: string): string {
  return `--letterSpacing-${name}`;
}

/**
 * The `--letterSpacing-<name>` custom properties a theme publishes: the built-in
 * `tighter`…`widest` — routed through the contract vars so a runtime theme/brand
 * swap still flows through — plus one entry per consumer-supplied value. Spread
 * into a theme class's `vars` (build time) or a `style` object (runtime).
 *
 * The built-in step names are reserved: entries by those names in `letterSpacings`
 * are ignored (they stay token-backed). Customise the built-in tracking via the
 * theme tokens (`brand.letterSpacing`) instead.
 */
export function letterSpacingVars(
  letterSpacings: Record<string, string> = {},
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of LETTER_SPACING_KEYS) {
    out[letterSpacingVarName(key)] = vars.text.letterSpacing[key];
  }
  for (const [name, value] of Object.entries(letterSpacings)) {
    // The built-in steps stay token-backed (`vars.text.letterSpacing.*`) so bare
    // text and e.g. `letterSpacing="widest"` never diverge; the registry can't
    // shadow them. Customise the built-ins through the theme tokens instead.
    if ((LETTER_SPACING_KEYS as readonly string[]).includes(name)) continue;
    out[letterSpacingVarName(name)] = value;
  }
  return out;
}
