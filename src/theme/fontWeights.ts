import { TEXT_WEIGHTS, type TextWeight } from "./constants";
import { vars } from "./contract.css";

/**
 * The consumer-defined font-weight vocabulary — an *open* vocabulary mirroring
 * `font` in {@link module:./fonts}.
 *
 * The built-in steps (`default`, `semibold`, `bold`, `superbold`) are a closed,
 * token-backed scale. A brand may want a weight outside that set (a hairline
 * `300`, a black `900`), so the open half can't ride the vanilla-extract contract
 * — it's a naming convention (`--fontWeight-<name>` custom properties, published
 * by the theme) plus this augmentable type seam.
 *
 * Baritone ships `FontWeightRegistry` empty, so `weight` starts as a loose
 * `string`. An app augments the interface with its own names, tightening `weight`
 * to the built-ins plus those names, with autocompletion.
 *
 * Declared names must line up with the `weights` option passed to
 * {@link createDesignSystemTheme} / {@link createInlineTheme} / `BaritoneTheme`,
 * which emits one `--fontWeight-<name>` per entry. Built-in steps are always
 * emitted and need no registry entry.
 *
 * @example
 * declare module "@saintly-software/baritone" {
 *   interface FontWeightRegistry {
 *     hairline: true;
 *     black: true;
 *   }
 * }
 * // `<Text weight="black">` now type-checks; `weight="heavy"` errors.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface FontWeightRegistry {}

/** The weight names Baritone always publishes, independent of the registry. */
export type BuiltinFontWeightName = TextWeight;

/**
 * The names accepted by the `weight` prop on `Text`/`Heading`. Resolves to a
 * loose `string` until a consumer augments {@link FontWeightRegistry}.
 */
export type FontWeightName = keyof FontWeightRegistry extends never
  ? string
  : BuiltinFontWeightName | (keyof FontWeightRegistry & string);

/**
 * The CSS custom property holding the `font-weight` for a given `name` — the
 * contract between the theme (publishes it) and the component (`weight` prop
 * reads it via `var(...)`). Mirrors {@link fontVarName}.
 */
export function fontWeightVarName(name: string): string {
  return `--fontWeight-${name}`;
}

/**
 * The `--fontWeight-<name>` custom properties a theme publishes: the built-in
 * steps (`default`…`superbold`, routed through the contract vars so a runtime
 * theme/brand swap still flows through) plus one entry per consumer-supplied
 * value. Spread into a theme class's `vars` (build time) or a `style` object
 * (runtime).
 *
 * Built-in step names are reserved: entries by those names in `weights` are
 * ignored, staying token-backed. Customise built-ins via the theme tokens instead.
 */
export function fontWeightVars(weights: Record<string, string> = {}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const weight of TEXT_WEIGHTS) {
    out[fontWeightVarName(weight)] = vars.text.weight[weight];
  }
  for (const [name, value] of Object.entries(weights)) {
    // Built-in steps stay token-backed so bare text and `weight="bold"` never diverge.
    if ((TEXT_WEIGHTS as readonly string[]).includes(name)) continue;
    out[fontWeightVarName(name)] = value;
  }
  return out;
}
