import { createVar } from "@vanilla-extract/css";

/**
 * Shared CSS custom property used to propagate the *current text colour* to
 * icons. `Text` (and the element recipes) set this to their resolved colour, and
 * `Icon`, when rendered inside, reads it so icon colour matches surrounding
 * text automatically. A standalone `Icon` ignores it and uses component tokens.
 */
export const iconColorVar = createVar("iconColor");

/**
 * The optical vertical alignment an inline `Icon` should take inside text, set by
 * `Text`/`Heading` alongside `--iconColor` so an inline icon sits centred against
 * the text. `Icon` falls back to `baseline` when standalone. See {@link iconColorVar}.
 */
export const iconVerticalAlignVar = createVar("iconAlign");

/**
 * The ambient text colour. The element-intent recipes publish their resolved
 * foreground here and `Text` reads it by default, so body copy inside a coloured
 * surface matches automatically; `intent`/`saliency` on `Text` overrides it.
 * Mirrors {@link iconColorVar}.
 */
export const textColorVar = createVar("textColor");

/**
 * The current font family — a var the size recipe reads (falling back to `sans`)
 * and the `font` prop overrides per instance. Mirrors {@link textColorVar}.
 */
export const textFontVar = createVar("textFont");

/**
 * The current letter-spacing — a var the size recipe reads (falling back to
 * `normal`), overridden by the `letterSpacing` prop or seeded by a theme's
 * `defaultLetterSpacing`. Mirrors {@link textFontVar}.
 */
export const textLetterSpacingVar = createVar("textLetterSpacing");

/**
 * The current font-size — a var the size recipe reads (falling back to the `md`
 * token) and the `size` prop overrides. See {@link module:../theme/fontSizes}.
 */
export const textSizeVar = createVar("textSize");

/**
 * The current line-height — a var the size recipe reads (falling back to `md`).
 * `size` sets it to its paired per-size leading; the `lineHeight` prop overrides.
 * See {@link module:../theme/lineHeights}.
 */
export const textLineHeightVar = createVar("textLineHeight");

/**
 * The current font-weight — a var the size recipe reads (falling back to
 * `default`), overridden by the `weight` prop or seeded by a theme's
 * `defaultWeight`. See {@link module:../theme/fontWeights}.
 */
export const textWeightVar = createVar("textWeight");

/**
 * The resolved focus-ring colour. Each element-intent recipe sets it to its
 * `focus.<intent>` token, and the shared `focusRingRecipe` reads it, so the ring
 * follows the element's intent without the focus recipe knowing about tokens.
 */
export const focusRingColorVar = createVar("focusRingColor");

/**
 * The padding a surface applies, exposed as a variable so descendants can react
 * to it — e.g. `Card.Bleed`/`Card.Divider` negate it with a matching negative
 * margin to span the surface edge-to-edge.
 */
export const surfacePaddingVar = createVar("surfacePadding");
