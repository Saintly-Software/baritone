import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { focusRingColorVar, iconColorVar, textColorVar } from "../../styles/vars.css";
import { vars } from "../../theme/contract.css";

// The active tab's colours, funnelled through local vars so the base style can
// stay flat while the intent x saliency compound variants just swap values —
// mirrors `componentIntentRecipe`.
const activeBg = createVar();
const activeFg = createVar();
const activeBd = createVar();

/** The tablist container — a wrapping horizontal row of tabs. */
export const tabsList = style({
  display: "inline-flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: vars.space[1],
});

/** Dim the whole row when every tab is disabled at the group level. */
export const tabsListDisabled = style({
  opacity: 0.55,
});

/**
 * One tab button. Pairs with `componentTypographyRecipe` for the box/size (so a
 * tab matches the height/radius/font of a `Chip`/`Button`) and only owns the
 * *colour*, which toggles on base-ui's selected marker. base-ui sets
 * `aria-selected="true"` (and `data-active`) on the active tab, so the fill is
 * the selection indicator: an inactive tab is transparent with muted text, the
 * active one takes the `intent` x `saliency` colour block (high = filled, mid =
 * washed, low = transparent + border), exactly like the rest of the "component"
 * family.
 */
export const tabsTab = recipe({
  base: {
    borderStyle: "solid",
    borderWidth: vars.borderWidth.thin,
    borderColor: "transparent",
    background: "transparent",
    color: vars.text.color.neutral.mid,
    vars: {
      [iconColorVar]: vars.text.color.neutral.mid,
      [textColorVar]: vars.text.color.neutral.mid,
    },
    selectors: {
      // Inactive hover: a subtle neutral wash + stronger text. Excludes the
      // active tab (its fill stays put) and disabled tabs (inert).
      '&:hover:not([aria-selected="true"]):not([aria-disabled="true"])': {
        background: vars.component.color.neutral.mid.default.bgc,
        color: vars.text.color.neutral.high,
        vars: {
          [iconColorVar]: vars.text.color.neutral.high,
          [textColorVar]: vars.text.color.neutral.high,
        },
      },
      '&[aria-selected="true"]': {
        background: activeBg,
        color: activeFg,
        borderColor: activeBd,
        vars: { [iconColorVar]: activeFg, [textColorVar]: activeFg },
      },
      // Disabled is modelled with `aria-disabled` (never the native attribute),
      // so the tab stays in the roving tab order; the dim comes from
      // `tabsTabDisabled` / `tabsListDisabled` so it never double-applies.
      '&[aria-disabled="true"]': {
        cursor: "not-allowed",
      },
    },
  },
  variants: {
    intent: Object.fromEntries(
      INTENTS.map((intent) => [
        intent,
        { vars: { [focusRingColorVar]: vars.component.focus[intent] } },
      ]),
    ) as Record<(typeof INTENTS)[number], { vars: Record<string, string> }>,
    saliency: Object.fromEntries(SALIENCIES.map((saliency) => [saliency, {}])) as Record<
      (typeof SALIENCIES)[number],
      Record<string, never>
    >,
  },
  compoundVariants: INTENTS.flatMap((intent) =>
    SALIENCIES.map((saliency) => {
      const block = vars.component.color[intent][saliency].default;
      return {
        variants: { intent, saliency },
        style: {
          vars: { [activeBg]: block.bgc, [activeFg]: block.text, [activeBd]: block.border },
        },
      };
    }),
  ),
  defaultVariants: {
    intent: "neutral",
    saliency: "mid",
  },
});

/** Dim a single disabled tab (only when the group as a whole isn't disabled). */
export const tabsTabDisabled = style({
  opacity: 0.55,
});

export type TabsTabVariants = NonNullable<RecipeVariants<typeof tabsTab>>;
