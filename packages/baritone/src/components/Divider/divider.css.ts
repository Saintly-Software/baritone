import { createVar, fallbackVar } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

const line = createVar();

export const dividerWeightVar = createVar("dividerWeight");

const weight = fallbackVar(dividerWeightVar, vars.borderWidth.thin);

export const dividerRoot = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  variants: {
    orientation: {
      horizontal: {
        flexDirection: "row",
        width: "100%",
      },
      vertical: {
        flexDirection: "column",
        alignSelf: "stretch",
        minHeight: "1em",
      },
    },

    labelled: {
      false: {
        background: line,
      },
      true: {
        gap: vars.space[3],
        selectors: {
          "&::before, &::after": {
            content: '""',
            flex: "1 1 auto",
            background: line,
          },
        },
      },
    },
    labelPosition: {
      start: {},
      center: {},
      end: {},
    },
    intent: Object.fromEntries(INTENTS.map((intent) => [intent, {}])) as Record<
      (typeof INTENTS)[number],
      Record<string, never>
    >,
    saliency: Object.fromEntries(SALIENCIES.map((saliency) => [saliency, {}])) as Record<
      (typeof SALIENCIES)[number],
      Record<string, never>
    >,
  },
  compoundVariants: [
    {
      variants: { orientation: "horizontal", labelled: false },
      style: { height: weight },
    },
    {
      variants: { orientation: "vertical", labelled: false },
      style: { width: weight },
    },
    {
      variants: { orientation: "horizontal", labelled: true },
      style: { selectors: { "&::before, &::after": { height: weight } } },
    },
    {
      variants: { orientation: "vertical", labelled: true },
      style: { selectors: { "&::before, &::after": { width: weight } } },
    },
    {
      variants: { labelled: true, labelPosition: "start" },
      style: { selectors: { "&::before": { flex: `0 0 ${vars.space[4]}` } } },
    },
    {
      variants: { labelled: true, labelPosition: "end" },
      style: { selectors: { "&::after": { flex: `0 0 ${vars.space[4]}` } } },
    },
    ...INTENTS.flatMap((intent) =>
      SALIENCIES.map((saliency) => ({
        variants: { intent, saliency },
        style: { vars: { [line]: vars.component.color[intent][saliency].default.border } },
      })),
    ),
  ],
  defaultVariants: {
    orientation: "horizontal",
    labelled: false,
    labelPosition: "center",
    intent: "neutral",
    saliency: "low",
  },
});

export type DividerVariants = NonNullable<RecipeVariants<typeof dividerRoot>>;
