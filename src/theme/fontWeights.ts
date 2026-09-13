import { TEXT_WEIGHTS, type TextWeight } from "./constants";
import { vars } from "./contract.css";

/**
 * The consumer-defined font-weight vocabulary — an *open* vocabulary mirroring
 * {@link FontRegistry} (see {@link module:./fonts} for the full pattern). Built-in
 * steps (`default`/`semibold`/`bold`/`superbold`); other names come from the
 * theme's `weights` option (emitting `--fontWeight-<name>`) plus augmenting this
 * interface to tighten the `weight` prop.
 *
 * @example
 * // Somewhere in the consuming app (e.g. a `baritone.d.ts`):
 * declare module "@saintly-software/baritone" {
 *   interface FontWeightRegistry {
 *     hairline: true;
 *     black: true;
 *   }
 * }
 * // Now `<Text weight="black">` type-checks and autocompletes; `weight="heavy"` errors.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface FontWeightRegistry {}

/** The weight names Baritone always publishes, independent of the registry. */
export type BuiltinFontWeightName = TextWeight;

/**
 * The names accepted by the `weight` prop on `Text`/`Heading`. Resolves to a loose
 * `string` until a consumer augments {@link FontWeightRegistry}, then tightens to
 * the built-ins plus their declared names.
 */
export type FontWeightName = keyof FontWeightRegistry extends never
  ? string
  : BuiltinFontWeightName | (keyof FontWeightRegistry & string);

/**
 * The CSS custom property that holds the `font-weight` for a given `name`. This is
 * the contract between the value side (the theme publishes `--fontWeight-<name>`)
 * and the component side (the `weight` prop reads `var(--fontWeight-<name>)`).
 * Mirrors {@link fontVarName}.
 */
export function fontWeightVarName(name: string): string {
  return `--fontWeight-${name}`;
}

/**
 * The `--fontWeight-<name>` custom properties a theme publishes: the built-in
 * steps (`default`…`superbold`) — routed through the contract vars so a runtime
 * theme/brand swap still flows through — plus one entry per consumer-supplied
 * value. Spread into a theme class's `vars` (build time) or a `style` object
 * (runtime).
 *
 * The built-in step names are reserved: entries by those names in `weights` are
 * ignored (they stay token-backed). Customise the built-in steps through the theme
 * tokens instead.
 */
export function fontWeightVars(weights: Record<string, string> = {}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const weight of TEXT_WEIGHTS) {
    out[fontWeightVarName(weight)] = vars.text.weight[weight];
  }
  for (const [name, value] of Object.entries(weights)) {
    if ((TEXT_WEIGHTS as readonly string[]).includes(name)) continue;
    out[fontWeightVarName(name)] = value;
  }
  return out;
}
