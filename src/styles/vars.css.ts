import { createVar } from "@vanilla-extract/css";

/**
 * CSS custom property that propagates the *current text colour* to icons.
 * `Text` (and the element recipes) set it to their resolved colour; `Icon`
 * reads it when nested so it matches. Standalone, `Icon` ignores it and uses component tokens.
 */
export const iconColorVar = createVar("iconColor");

/**
 * CSS custom property carrying the *optical vertical alignment* an `Icon`
 * takes flowing inline inside text. `Text`/`Heading` set it alongside
 * `--iconColor` so an inline icon sits centred against the text rather than on
 * the baseline; `Icon` falls back to `baseline` standalone or in a flex context
 * (where `vertical-align` is a no-op). Alignment analogue of {@link iconColorVar}.
 */
export const iconVerticalAlignVar = createVar("iconAlign");

/**
 * CSS custom property holding the *ambient text colour*. The element-intent
 * recipes (`surface`, `component`) publish their resolved foreground here, and
 * `Text` reads it by default, so body copy inside a coloured surface matches
 * automatically. `intent`/`saliency` on `Text` overrides it. Mirrors `iconColorVar`.
 */
export const textColorVar = createVar("textColor");

/**
 * The *current font family*, mirroring {@link textColorVar}. The size recipe
 * reads this (falling back to `sans`); the `font` prop on `Text`/`Heading` sets
 * it per instance to `var(--font-<name>)` from the active theme. Unset, text
 * stays on `sans`.
 */
export const textFontVar = createVar("textFont");

/**
 * The *current letter-spacing (tracking)*, mirroring {@link textFontVar}. The
 * size recipe reads this (falling back to `normal`); the `letterSpacing` prop
 * on `Text`/`Heading` sets it per instance to `var(--letterSpacing-<name>)`. A
 * theme's `defaultLetterSpacing` can seed it at the root.
 */
export const textLetterSpacingVar = createVar("textLetterSpacing");

/**
 * The *current font-size*, mirroring {@link textFontVar}. The size recipe reads
 * this (falling back to `md`); the `size` prop on `Text`/`Heading` sets it per
 * instance to `var(--fontSize-<name>)`. The built-in `size` variant sets it
 * too, for module-scope callers that apply a size as a class. See {@link module:../theme/fontSizes}.
 */
export const textSizeVar = createVar("textSize");

/**
 * The *current line-height*, mirroring {@link textSizeVar}. `size` defaults it
 * to its paired per-size leading (`var(--lineHeight-<size>)`); `lineHeight`
 * overrides it to `var(--lineHeight-<name>)`. See {@link module:../theme/lineHeights}.
 */
export const textLineHeightVar = createVar("textLineHeight");

/**
 * The *current font-weight*, mirroring {@link textFontVar}. The `weight` prop
 * on `Text`/`Heading` sets it to `var(--fontWeight-<name>)`; a theme's
 * `defaultWeight` can seed it at the root. The built-in `weight` variant
 * (`typographyWeight`) sets it too, for module-scope class-based callers. See {@link module:../theme/fontWeights}.
 */
export const textWeightVar = createVar("textWeight");

/**
 * The resolved focus-ring colour. Each element-intent recipe sets this to its
 * `focus.<intent>` token; `focusRingRecipe` reads it, so ring colour follows
 * intent/state without the focus recipe knowing about tokens.
 */
export const focusRingColorVar = createVar("focusRingColor");

/**
 * The padding a surface applies, exposed so descendants can react to it — e.g.
 * `Card.Bleed`/`Card.Divider` negate it with a matching negative margin to span edge-to-edge.
 */
export const surfacePaddingVar = createVar("surfacePadding");
