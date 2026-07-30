import { LINE_HEIGHT_KEYS, TEXT_SIZES, type LineHeightKey } from "./constants";
import { vars } from "./contract.css";

/**
 * The consumer-defined line-height (leading) vocabulary — an *open* vocabulary
 * mirroring the `font` one in {@link module:./fonts}.
 *
 * The built-in steps (`none`…`loose`) are a closed, token-backed scale of unitless
 * multipliers baked into the theme contract. But a brand often wants a leading
 * outside that ramp, and the exact set only exists at *its* build/runtime. So, like
 * `font`, the open half can't ride the vanilla-extract contract; it's a naming
 * convention (`--lineHeight-<name>` custom properties, published by the theme) plus
 * this augmentable type seam.
 *
 * `lineHeight` is an *override*: left unset, `size` supplies each element's
 * line-height (the built-in sizes keep their tuned per-size leading). Setting
 * `lineHeight` picks a value from this vocabulary instead.
 *
 * Baritone ships `LineHeightRegistry` empty, so the `lineHeight` prop starts as a
 * loose `string`. An app declares its own names by augmenting the interface, which
 * tightens `lineHeight` to the built-ins plus their declared names with
 * autocompletion — while Baritone stays ignorant of what those names are.
 *
 * The declared names must line up with the values handed to the theme (the
 * `lineHeights` option on {@link createDesignSystemTheme} / {@link createInlineTheme}
 * / `BaritoneTheme`), which emits one `--lineHeight-<name>` per entry. The built-in
 * steps are always emitted, so they need no registry entry.
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

// The reserved line-height names — the built-in leadings *and* the size names. A
// consumer `lineHeights` entry can't shadow either: the leadings stay token-backed,
// and the per-size names below back `size`'s paired default line-height.
const RESERVED_LINE_HEIGHT_NAMES: readonly string[] = [...LINE_HEIGHT_KEYS, ...TEXT_SIZES];

/**
 * The `--lineHeight-<name>` custom properties a theme publishes:
 *   - the named leadings (`none`…`loose`) from the `text.lineHeight` tokens — the
 *     `lineHeight` prop's built-in vocabulary, and
 *   - one per size (`xs`…`9xl`) from the per-size `text.size.<name>.lineHeight`
 *     tokens — the paired default `size` applies when `lineHeight` is unset,
 * both routed through the contract vars so a runtime theme/brand swap still flows
 * through, plus one entry per consumer-supplied value. Spread into a theme class's
 * `vars` (build time) or a `style` object (runtime).
 *
 * The built-in leading names and the size names are reserved: entries by those
 * names in `lineHeights` are ignored (they stay token-backed). Customise them
 * through the theme tokens (`BrandSeed.lineHeight` / `BrandSeed.fontScale`) instead.
 */
export function lineHeightVars(lineHeights: Record<string, string> = {}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of LINE_HEIGHT_KEYS) {
    out[lineHeightVarName(key)] = vars.text.lineHeight[key];
  }
  for (const size of TEXT_SIZES) {
    out[lineHeightVarName(size)] = vars.text.size[size].lineHeight;
  }
  for (const [name, value] of Object.entries(lineHeights)) {
    if (RESERVED_LINE_HEIGHT_NAMES.includes(name)) continue;
    out[lineHeightVarName(name)] = value;
  }
  return out;
}
