import { LINE_HEIGHT_KEYS, type LineHeightKey } from "./constants";
import { vars } from "./contract.css";

/**
 * The consumer-defined line-height (leading) vocabulary — an *open* vocabulary
 * mirroring the `font` one in {@link module:./fonts}.
 *
 * The built-in steps (`none`…`loose`) are a closed, token-backed scale baked
 * into the theme contract, but a brand's extra leadings only exist at *its*
 * build/runtime — so, like `font`, this rides a naming convention
 * (`--lineHeight-<name>` custom properties) plus this augmentable type seam.
 *
 * `lineHeight` is an *override*: left unset, `size` supplies each element's
 * line-height; setting `lineHeight` picks a value from this vocabulary instead.
 *
 * Baritone ships `LineHeightRegistry` empty, so `lineHeight` starts as a loose
 * `string`. An app augments the interface to declare its own names, tightening
 * it to the built-ins plus those names with autocompletion.
 *
 * Declared names must match the values handed to the theme (the `lineHeights`
 * option on {@link createDesignSystemTheme} / {@link createInlineTheme} /
 * `BaritoneTheme`), which emits one `--lineHeight-<name>` per entry. Built-in
 * steps are always emitted, so need no registry entry.
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
 * The names accepted by the `lineHeight` prop on `Text`/`Heading`; a loose
 * `string` until a consumer augments {@link LineHeightRegistry}, then the
 * built-in leadings plus their declared names.
 */
export type LineHeightName = keyof LineHeightRegistry extends never
  ? string
  : BuiltinLineHeightName | (keyof LineHeightRegistry & string);

/**
 * The CSS custom property holding the `line-height` for a given `name` — the
 * contract between the theme (publishes `--lineHeight-<name>`) and the component
 * (`lineHeight` reads `var(--lineHeight-<name>)`). Mirrors {@link fontVarName}.
 */
export function lineHeightVarName(name: string): string {
  return `--lineHeight-${name}`;
}

/**
 * The `--lineHeight-<name>` custom properties the leading vocabulary publishes:
 * built-in named leadings (via the contract vars, for runtime theme swaps) plus
 * one entry per consumer-supplied value. Spread into a theme class's `vars`
 * (build time) or a `style` object (runtime).
 *
 * Size-paired leadings live in a separate namespace — `--sizeLineHeight-<name>`,
 * see {@link fontSizeVars} — so a size and standalone leading can share a name
 * without colliding.
 *
 * Built-in leading names are reserved: entries by those names in `lineHeights`
 * are ignored (they stay token-backed). Customise them via the theme tokens
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
