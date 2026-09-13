import { LINE_HEIGHT_KEYS, type LineHeightKey } from "./constants";
import { vars } from "./contract.css";

/**
 * The consumer-defined line-height (leading) vocabulary — an *open* vocabulary
 * mirroring {@link FontRegistry} (see {@link module:./fonts} for the full pattern).
 * Built-in steps (`none`…`loose`); other names come from the theme's `lineHeights`
 * option (emitting `--lineHeight-<name>`) plus augmenting this interface.
 * `lineHeight` is an override — left unset, `size` supplies the leading.
 *
 * @example
 * // Somewhere in the consuming app (e.g. a `baritone.d.ts`):
 * declare module "@saintly-software/baritone" {
 *   interface LineHeightRegistry {
 *     airy: true;
 *   }
 * }
 * // Now `<Text lineHeight="airy">` type-checks and autocompletes; `lineHeight="tall"` errors.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface LineHeightRegistry {}

/** The leading names Baritone always publishes, independent of the registry. */
export type BuiltinLineHeightName = LineHeightKey;

/**
 * The names accepted by the `lineHeight` prop on `Text`/`Heading`. Resolves to a
 * loose `string` until a consumer augments {@link LineHeightRegistry}, then
 * tightens to the built-in leadings plus their declared names.
 */
export type LineHeightName = keyof LineHeightRegistry extends never
  ? string
  : BuiltinLineHeightName | (keyof LineHeightRegistry & string);

/**
 * The CSS custom property that holds the `line-height` for a given `name`. This is
 * the contract between the value side (the theme publishes `--lineHeight-<name>`)
 * and the component side (the `lineHeight` prop reads `var(--lineHeight-<name>)`).
 * Mirrors {@link fontVarName}.
 */
export function lineHeightVarName(name: string): string {
  return `--lineHeight-${name}`;
}

/**
 * The `--lineHeight-<name>` custom properties the *leading vocabulary* publishes:
 * the named leadings (`none`…`loose`) from the `text.lineHeight` tokens — the
 * `lineHeight` prop's built-in scale — routed through the contract vars so a runtime
 * theme/brand swap still flows through, plus one entry per consumer-supplied value.
 * Spread into a theme class's `vars` (build time) or a `style` object (runtime).
 *
 * The size-paired leadings (the default `size` applies) live in the size vocabulary
 * under a *separate* namespace — `--sizeLineHeight-<name>`, see {@link fontSizeVars} —
 * so a consumer size and a standalone leading may reuse the same name without
 * colliding; only the built-in leading names are reserved here.
 *
 * The built-in leading names are reserved: entries by those names in `lineHeights`
 * are ignored (they stay token-backed). Customise them through the theme tokens
 * (`BrandSeed.lineHeight`) instead.
 */
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
