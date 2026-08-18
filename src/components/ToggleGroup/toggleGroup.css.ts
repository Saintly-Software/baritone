import { globalStyle, style } from "@vanilla-extract/css";
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
 * The `width: 100%` for a filled group is applied as the shared `resolveWidth`
 * sprinkles atom in `index.tsx` (the single source `Box` / `Flex` / `Button`
 * use), so this recipe never re-encodes the shorthand — it owns only the axis.
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
  },
  defaultVariants: { orientation: "horizontal" },
});

/**
 * The layout *response* to `width="fill"` on a *horizontal* group: grow the
 * segments so they share the filled width instead of sitting natural-width with a
 * ragged trailing gap at the inline-start. Applied only for a filled horizontal
 * toolbar (a vertical column already shares the width via `align-items: stretch`,
 * and growing its children would stretch them along the *main*, vertical axis
 * into tall buttons). The width atom can't express this, and vanilla-extract's
 * `selectors` can't target children — hence a dedicated class + `globalStyle`.
 */
export const toggleGroupFillRow = style({});
globalStyle(`${toggleGroupFillRow} > *`, {
  flexGrow: 1,
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
