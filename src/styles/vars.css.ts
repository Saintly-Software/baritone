import { createVar } from '@vanilla-extract/css';

/**
 * Shared CSS custom property used to propagate the *current text colour* to
 * icons. `Text` (and the element recipes) set this to their resolved colour, and
 * `Icon`, when rendered inside, reads it so icon colour matches surrounding
 * text automatically. A standalone `Icon` ignores it and uses component tokens.
 */
export const iconColorVar = createVar('iconColor');

/**
 * Shared CSS custom property holding the *ambient text colour*. The element-intent
 * recipes (`surface`, `component`) publish their resolved foreground here, and
 * `Text` reads it by default — so body copy placed inside a coloured surface or
 * component matches automatically, without the text needing to know the intent.
 * Passing `intent`/`saliency` to `Text` overrides the inherited value. Mirrors
 * `iconColorVar`.
 */
export const textColorVar = createVar('textColor');

/**
 * The resolved focus-ring colour. Each element-intent recipe (`surface`,
 * `component`, `formControl`) sets this to its `focus.<intent>` token; the shared
 * `focusRingRecipe` reads it when drawing the ring, so the ring colour follows
 * the element's intent/state without the focus recipe knowing about tokens.
 */
export const focusRingColorVar = createVar('focusRingColor');

/**
 * The padding a surface applies, exposed as a variable so descendants can react
 * to it — e.g. `Card.Bleed`/`Card.Divider` negate it with a matching negative
 * margin to span the surface edge-to-edge.
 */
export const surfacePaddingVar = createVar('surfacePadding');
