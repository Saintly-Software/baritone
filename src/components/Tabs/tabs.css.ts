import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { focusRingColorVar, iconColorVar, textColorVar } from "../../styles/vars.css";
import { vars } from "../../theme/contract.css";

const activeBg = createVar();
const activeFg = createVar();
const activeBd = createVar();

export const tabsList = style({
  display: "inline-flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: vars.space[1],
});

export const tabsListDisabled = style({
  opacity: 0.55,
});

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

export const tabsTabDisabled = style({
  opacity: 0.55,
});

export const tabsPanel = style({
  paddingBlock: vars.space[2],
  color: vars.text.color.neutral.high,
  vars: {
    [textColorVar]: vars.text.color.neutral.high,
    [iconColorVar]: vars.text.color.neutral.high,
  },
});

export type TabsTabVariants = NonNullable<RecipeVariants<typeof tabsTab>>;
