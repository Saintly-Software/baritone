import { style } from "@vanilla-extract/css";

/**
 * The delimiter drawn between items. `aria-hidden` in the markup keeps it out of
 * the accessibility tree; `user-select: none` keeps it out of copied text — so
 * selecting "12 lines · 340 words" yields "12 lines 340 words", not the dots.
 * Colour and size are left to inherit, so the separator tracks whatever text
 * context the list sits in.
 */
export const inlineListSeparator = style({
  userSelect: "none",
});
