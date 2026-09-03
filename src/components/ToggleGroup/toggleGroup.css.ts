import { globalStyle, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * The group container — a set of toggle buttons (a segmented control). It owns
 * only layout; every button's box/colour/focus ring comes from the shared
 * `component` recipe through `InternalButton`, so a selected segment reads
 * like a `Button`/`Chip` with the same `intent` x `saliency`.
 *
 * `orientation` drives the *paint*; the matching *keyboard* axis is base-ui's,
 * wired by passing the same orientation to its `ToggleGroup` (see `index.tsx`).
 * A `horizontal` toolbar centres segments on the cross axis; a `vertical`
 * column stretches them to share one width instead of hugging their labels.
 *
 * `width: 100%` for a filled group comes from the shared `resolveWidth`
 * sprinkles atom in `index.tsx`, so this recipe owns only the axis.
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
 * The layout *response* to `width="fill"` on a *horizontal* group: grows
 * segments to share the filled width instead of leaving a ragged trailing gap.
 * Only for horizontal — a vertical column already shares width via
 * `align-items: stretch`, and growing children there would stretch them along
 * the main axis into tall buttons. Needs a dedicated class + `globalStyle`
 * since vanilla-extract's `selectors` can't target children.
 */
export const toggleGroupFillRow = style({});
globalStyle(`${toggleGroupFillRow} > *`, {
  flexGrow: 1,
});

/**
 * Dim the whole group when disabled — purely the visual cue; disabled is
 * modelled with `aria-disabled` (never the native attribute) so buttons stay
 * in the roving tab order. Mirrors `radioGroupDisabled`/`tabsListDisabled`.
 */
export const toggleGroupDisabled = style({
  opacity: 0.55,
});

export type ToggleGroupRootVariants = NonNullable<RecipeVariants<typeof toggleGroupRoot>>;
