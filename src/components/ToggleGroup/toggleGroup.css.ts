import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * The group container — a set of toggle buttons (a segmented control). It owns
 * only layout; every button's box / colour / focus ring comes from the shared
 * `component` recipe through `InternalButton`, so a selected segment reads
 * exactly like a `Button` / `Chip` with the same `intent` x `saliency`.
 *
 * `orientation` drives the *paint*; the matching *keyboard* axis is base-ui's,
 * wired by passing the same orientation to its `ToggleGroup` (see `index.tsx`).
 * The `horizontal` toolbar centres its segments on the cross axis; the
 * `vertical` column stretches them so they share one width down the stack
 * instead of each hugging its own label.
 *
 * `width` is the optional fill knob — the same `fill` / `fit` / `inherit`
 * shorthand `Box` / `Flex` / `Button` take. It exists because the group is
 * `inline-flex` (it shrink-wraps its segments), so a vertical group in a
 * fixed-width sidebar couldn't be made to fill from props; `fill` lets it span
 * its container. Left unset, the group keeps its natural shrink-to-content size.
 */
export const toggleGroupRoot = recipe({
  base: {
    display: "inline-flex",
    gap: vars.space[1],
  },
  variants: {
    orientation: {
      horizontal: { flexDirection: "row", alignItems: "center" },
      vertical: { flexDirection: "column", alignItems: "stretch" },
    },
    width: {
      fill: { width: "100%" },
      fit: { width: "fit-content" },
      inherit: { width: "inherit" },
    },
  },
  defaultVariants: { orientation: "horizontal" },
});

/**
 * Dim the whole group when it's disabled. Disabled is modelled the focusable way
 * (aria-disabled on this container + a veto in the change handler, never the
 * native attribute), so the buttons stay in the roving tab order — this is purely
 * the visual cue. Mirrors `radioGroupDisabled` / `tabsListDisabled`.
 */
export const toggleGroupDisabled = style({
  opacity: 0.55,
});

export type ToggleGroupRootVariants = NonNullable<RecipeVariants<typeof toggleGroupRoot>>;
