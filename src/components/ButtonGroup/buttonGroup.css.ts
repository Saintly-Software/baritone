import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * The group container — a horizontal cluster of buttons rendered as one joined
 * surface (no `gap`: the buttons abut so their borders merge into a single
 * seam). Layout only; each button's box / colour / focus ring comes from the
 * shared `component` recipe through `InternalButton`, so a member reads exactly
 * like a standalone `Button` with the same `intent` x `saliency` — just with its
 * inner corners squared off.
 */
export const buttonGroupRoot = style({
  display: "inline-flex",
  alignItems: "center",
});

/**
 * Per-member styling layered on top of the `component` recipe, keyed by the
 * button's position in the row. The recipe already draws the full
 * `vars.component.borderRadius` on every corner and a `thin` border all round;
 * this only *collapses* the joins:
 *
 *   - **Radii** — the two ends keep their outer radius (the group's rounded
 *     silhouette); every corner that faces a neighbour is squared to 0, using
 *     logical corner properties so it stays correct in RTL.
 *   - **Borders** — abutting members would otherwise stack two `thin` borders
 *     into a double-thick seam, so every member after the first is pulled back
 *     by one border width to overlap its neighbour into a single hairline.
 *
 * `position: relative` + a raised `z-index` on hover/focus lifts the active
 * member above its siblings so its border tint and focus outline are never
 * clipped by the button painted after it.
 */
export const buttonGroupItemRecipe = recipe({
  base: {
    position: "relative",
    selectors: {
      "&:hover": { zIndex: 1 },
      "&:focus-visible": { zIndex: 2 },
    },
  },
  variants: {
    position: {
      // Lone button: a plain `Button`, no joins to collapse.
      only: {},
      // Leftmost: keep the start corners, square the end (neighbour) corners.
      first: {
        borderStartEndRadius: 0,
        borderEndEndRadius: 0,
      },
      // Interior: square every corner and overlap the previous member's border.
      middle: {
        borderRadius: 0,
        marginInlineStart: `calc(-1 * ${vars.borderWidth.thin})`,
      },
      // Rightmost: keep the end corners, square the start (neighbour) corners.
      last: {
        borderStartStartRadius: 0,
        borderEndStartRadius: 0,
        marginInlineStart: `calc(-1 * ${vars.borderWidth.thin})`,
      },
    },
  },
});

export type ButtonGroupItemVariants = NonNullable<RecipeVariants<typeof buttonGroupItemRecipe>>;
