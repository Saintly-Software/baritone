import type { TextSize, TextWeight } from "./constants";
import { vars } from "./contract.css";
import { fontVarName, type FontName } from "./fonts";

/**
 * The consumer-defined *text style* vocabulary — a second open vocabulary in
 * Baritone, riding the exact same seam as {@link FontRegistry}.
 *
 * A `textStyle` names a reusable typographic *role* — a bundle of several
 * properties (size, line-height, weight, family) under one app-declared name. It
 * generalizes the `font` prop from one property to several: where `font` publishes
 * one `--font-<name>` per family, a `textStyle` publishes a small group of
 * `--textStyle-<name>-<prop>` custom properties per role, and the `textStyle` prop
 * on `Text`/`Heading` points the recipe's instance vars at them.
 *
 * Like fonts, the set of roles an app wants only exists at *its* build/runtime,
 * after Baritone has compiled — so it can't ride the vanilla-extract contract.
 * Baritone ships `TextStyleRegistry` empty, so `textStyle` starts as a loose
 * `string`. An app declares its own roles by augmenting the interface, which
 * tightens `textStyle` to its names with autocompletion — while Baritone stays
 * ignorant of what those names are.
 *
 * The declared names must line up with the styles handed to the theme (the
 * `textStyles` option on {@link createDesignSystemTheme} / {@link createInlineTheme}
 * / `BaritoneTheme`), which emits the `--textStyle-<name>-*` properties per role.
 *
 * @example
 * // Somewhere in the consuming app (e.g. a `baritone.d.ts`):
 * declare module "@saintly-software/baritone" {
 *   interface TextStyleRegistry {
 *     title: true;
 *     lyric: true;
 *   }
 * }
 * // Now `<Heading textStyle="title">` type-checks and autocompletes.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intentionally empty; consumers augment it.
export interface TextStyleRegistry {}

/**
 * The names accepted by the `textStyle` prop on `Text`/`Heading`. Resolves to a
 * loose `string` until a consumer augments {@link TextStyleRegistry}, then tightens
 * to exactly their declared names. Unlike {@link FontName} there are no built-in
 * style names — Baritone ships no default roles.
 */
export type TextStyleName = keyof TextStyleRegistry extends never
  ? string
  : keyof TextStyleRegistry & string;

/**
 * A single text-style definition: the typographic properties a role bundles.
 * Every field is optional — a style sets only the properties it wants to own, and
 * the rest fall through to the component's usual defaults (an omitted `fontSize`
 * lands on the `md` size token, an omitted `weight` on `text.weight.default`,
 * etc.) via the recipe's `fallbackVar` chain.
 *
 * `size` is a convenience that resolves to a `text.size` token's `fontSize` +
 * `lineHeight`; an explicit `fontSize`/`lineHeight` overrides the corresponding
 * half of it. So `{ size: "xl", lineHeight: 1.85 }` is "the `xl` font-size at a
 * looser line-height".
 *
 * **Phase 1** covers `fontSize`, `lineHeight`, `fontWeight`, and `fontFamily`;
 * `letterSpacing` + `italic` are deferred to a later phase.
 */
export interface TextStyleDef {
  /** Convenience: pull `fontSize`+`lineHeight` from this `text.size` token. */
  size?: TextSize;
  /** Explicit font-size (any CSS length). Overrides the `size` convenience. */
  fontSize?: string;
  /** Explicit line-height (unitless number or any CSS value). Overrides `size`. */
  lineHeight?: string | number;
  /** Font family, by name — a built-in (`sans`/`mono`) or a consumer `fonts` entry. */
  font?: FontName;
  /** Font weight, from the `text.weight` tokens. */
  weight?: TextWeight;
}

/**
 * The four instance properties a `textStyle` can publish, in the CSS-var suffix
 * form used by {@link textStyleVarName} and read back by the size recipe's
 * `fallbackVar` chain. `fontSize`/`lineHeight`/`fontWeight`/`fontFamily` map 1:1 to
 * the recipe's `fontSizeVar`/`lineHeightVar`/`fontWeightVar`/`textFontVar`.
 */
export const TEXT_STYLE_PROPS = ["fontSize", "lineHeight", "fontWeight", "fontFamily"] as const;
export type TextStyleVarProp = (typeof TEXT_STYLE_PROPS)[number];

/**
 * The CSS custom property that carries one property of a named text style. This is
 * the contract between the value side (the theme publishes `--textStyle-<name>-<prop>`)
 * and the component side (the `textStyle` prop reads `var(--textStyle-<name>-<prop>)`
 * into the matching recipe instance var).
 */
export function textStyleVarName(name: string, prop: TextStyleVarProp): string {
  return `--textStyle-${name}-${prop}`;
}

/**
 * The `--textStyle-<name>-<prop>` custom properties a theme publishes — one group
 * per entry in the `textStyles` option, emitting *only* the properties each style
 * defines. Spread into a theme class's `vars` (build time) or a `style` object
 * (runtime), alongside {@link fontFamilyVars}.
 *
 * Omitted properties are deliberately *not* emitted: the component still points its
 * instance var at `var(--textStyle-<name>-<prop>)`, which — being unset — resolves
 * to the guaranteed-invalid value, so the recipe's downstream `fallbackVar` falls
 * back to the base token (the `md` size, `text.weight.default`, the `sans` family).
 * This is the same var-chaining `fallbackVar` already relies on for `--textFont`.
 *
 * Values are routed through the contract vars (`vars.text.size[…]`,
 * `vars.text.weight[…]`, `var(--font-<name>)`) rather than literals, so a runtime
 * theme/brand swap still flows through — mirroring how {@link fontFamilyVars} emits
 * `vars.font.sans`.
 */
export function textStyleVars(
  textStyles: Record<string, TextStyleDef> = {},
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, def] of Object.entries(textStyles)) {
    // `size` is the convenience baseline for the two size-token props; an explicit
    // `fontSize`/`lineHeight` below overrides its half.
    if (def.size !== undefined) {
      out[textStyleVarName(name, "fontSize")] = vars.text.size[def.size].fontSize;
      out[textStyleVarName(name, "lineHeight")] = vars.text.size[def.size].lineHeight;
    }
    if (def.fontSize !== undefined) {
      out[textStyleVarName(name, "fontSize")] = def.fontSize;
    }
    if (def.lineHeight !== undefined) {
      out[textStyleVarName(name, "lineHeight")] = String(def.lineHeight);
    }
    if (def.weight !== undefined) {
      out[textStyleVarName(name, "fontWeight")] = vars.text.weight[def.weight];
    }
    if (def.font !== undefined) {
      out[textStyleVarName(name, "fontFamily")] = `var(${fontVarName(def.font)})`;
    }
  }
  return out;
}
