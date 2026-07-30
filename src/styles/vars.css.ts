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
 * The three *text-style instance vars* — the size-recipe analogues of
 * {@link textFontVar}, one per themeable typographic property a `textStyle` bundle
 * can own. The size recipe's base reads each with a token fallback
 * (`fallbackVar(fontSizeVar, vars.text.size.md.fontSize)`, etc.), so an unset var
 * resolves to the usual default; the `textStyle` prop on `Text`/`Heading` points
 * them per instance at `var(--textStyle-<name>-<prop>)`, the values the theme
 * published. Family reuses `textFontVar` (a `textStyle` sets it to
 * `var(--textStyle-<name>-fontFamily)`), so there's no separate var for it.
 */
export const fontSizeVar = createVar("fontSize");
export const lineHeightVar = createVar("lineHeight");
export const fontWeightVar = createVar("fontWeight");

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
