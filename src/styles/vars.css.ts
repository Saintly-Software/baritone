import { createVar } from "@vanilla-extract/css";

/**
 * Shared CSS custom property used to propagate the *current text colour* to
 * icons. `Text` (and the element recipes) set this to their resolved colour, and
 * `Icon`, when rendered inside, reads it so icon colour matches surrounding
 * text automatically. A standalone `Icon` ignores it and uses component tokens.
 */
export const iconColorVar = createVar("iconColor");

/**
 * Shared CSS custom property holding the *ambient text colour*. The element-intent
 * recipes (`surface`, `component`) publish their resolved foreground here, and
 * `Text` reads it by default — so body copy placed inside a coloured surface or
 * component matches automatically, without the text needing to know the intent.
 * Passing `intent`/`saliency` to `Text` overrides the inherited value. Mirrors
 * `iconColorVar`.
 */
export const textColorVar = createVar("textColor");

/**
 * The *current font family*, mirroring {@link textColorVar}. The size recipe reads
 * this (falling back to the `sans` token) so the resolved family is a single
 * indirection; the `font` prop on `Text`/`Heading` sets it per instance to
 * `var(--font-<name>)`, pointing at a family the active theme published. Left
 * unset, text stays on `sans` — so this is the font analogue of the inherited
 * `--textColor`: a var the element reads, a prop that overrides it.
 */
export const textFontVar = createVar("textFont");

/**
 * The *current letter-spacing (tracking)*, mirroring {@link textFontVar}. The size
 * recipe reads this (falling back to the CSS `normal` keyword) so the resolved
 * tracking is a single indirection; the `letterSpacing` prop on `Text`/`Heading`
 * sets it per instance to `var(--letterSpacing-<name>)`, pointing at a value the
 * active theme published. Left unset, text stays on `normal` — so this is the
 * tracking analogue of `--textFont`: a var the element reads, a prop that
 * overrides it. A theme's `defaultLetterSpacing` can seed it at the root.
 */
export const textLetterSpacingVar = createVar("textLetterSpacing");

/**
 * The *current font-size*, mirroring {@link textFontVar}. The size recipe reads
 * this (falling back to the `md` font-size token) so the resolved size is a single
 * indirection; the `size` prop on `Text`/`Heading` sets it per instance to
 * `var(--fontSize-<name>)`, pointing at a size the active theme published. The
 * built-in `size` variant sets it too (from the per-size token) for the module-scope
 * callers that apply a size as a class. See {@link module:../theme/fontSizes}.
 */
export const textSizeVar = createVar("textSize");

/**
 * The *current line-height*, mirroring {@link textSizeVar}. The size recipe reads
 * this (falling back to the `md` line-height token). By default `size` sets it to
 * its paired per-size leading (`var(--lineHeight-<size>)`); the `lineHeight` prop
 * overrides it to `var(--lineHeight-<name>)`, a value the active theme published.
 * See {@link module:../theme/lineHeights}.
 */
export const textLineHeightVar = createVar("textLineHeight");

/**
 * The *current font-weight*, mirroring {@link textFontVar}. The size recipe reads
 * this (falling back to the `default` weight token); the `weight` prop on
 * `Text`/`Heading` sets it per instance to `var(--fontWeight-<name>)`, and a theme's
 * `defaultWeight` can seed it at the root. Left unset, text stays on the default
 * weight — so, like `--textFont`, it's a var the element reads and a prop that
 * overrides it. The built-in `weight` variant (`typographyWeight`) sets it too for
 * the module-scope callers that apply a weight as a class.
 * See {@link module:../theme/fontWeights}.
 */
export const textWeightVar = createVar("textWeight");

/**
 * The resolved focus-ring colour. Each element-intent recipe (`surface`,
 * `component`, `formControl`) sets this to its `focus.<intent>` token; the shared
 * `focusRingRecipe` reads it when drawing the ring, so the ring colour follows
 * the element's intent/state without the focus recipe knowing about tokens.
 */
export const focusRingColorVar = createVar("focusRingColor");

/**
 * The padding a surface applies, exposed as a variable so descendants can react
 * to it — e.g. `Card.Bleed`/`Card.Divider` negate it with a matching negative
 * margin to span the surface edge-to-edge.
 */
export const surfacePaddingVar = createVar("surfacePadding");

// ---------------------------------------------------------------------------
// Control-sizing indirection vars. Each is the single hop between the open size
// vocabularies (which set it per instance to a `var(--controlSize-<name>-<field>)`
// / `var(--selectionSize-<name>-<field>)` the theme published) and the recipe base
// (which reads it with a `fallbackVar` to the built-in `md` token). Mirrors the
// `--text…` typography indirection above. Wired into the recipes in a later phase;
// declared here so the seam is defined in one place. See `theme/controlSizes.ts`
// and `theme/selectionSizes.ts`.
// ---------------------------------------------------------------------------

/** The *current control height* (Button/TextInput/Select/Combobox). */
export const controlHeightVar = createVar("controlHeight");
/** The *current control inline padding*. */
export const controlPaddingInlineVar = createVar("controlPaddingInline");
/** The *current control font-size*. */
export const controlFontSizeVar = createVar("controlFontSize");
/** The *current control gap* (icon↔label). */
export const controlGapVar = createVar("controlGap");

/** The *current selection-control box/track height* (Checkbox/Radio/Switch). */
export const selectionBoxVar = createVar("selectionBox");
/** The *current selection-control label font-size*. */
export const selectionFontSizeVar = createVar("selectionFontSize");
