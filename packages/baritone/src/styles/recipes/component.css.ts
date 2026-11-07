import { createVar } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { INTENTS, SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";
import { active, hover } from "../../theme/oklch";
import { focusRingColorVar, iconColorVar, textColorVar } from "../vars.css";

const bgc = createVar();
const bgcHover = createVar();
const bgcActive = createVar();
const fg = createVar();
const bd = createVar();
const bgcDisabled = createVar();
const fgDisabled = createVar();
const bdDisabled = createVar();

const sizes = {
  sm: { height: "1.5rem", px: vars.space[2], font: vars.text.size.xs },
  md: { height: "2rem", px: vars.space[3], font: vars.text.size.sm },
  lg: { height: "2.5rem", px: vars.space[4], font: vars.text.size.md },
} as const;

export const componentIntentRecipe = recipe({
  base: {
    borderStyle: "solid",
    borderWidth: vars.borderWidth.thin,
    borderColor: bd,
    background: bgc,
    color: fg,
    vars: { [iconColorVar]: fg, [textColorVar]: fg },
    selectors: {
      '&[aria-disabled="true"]': {
        background: bgcDisabled,
        color: fgDisabled,
        borderColor: bdDisabled,
        cursor: "not-allowed",
        vars: { [iconColorVar]: fgDisabled, [textColorVar]: fgDisabled },
      },
    },
  },
  variants: {
    interactive: {
      control: {
        selectors: {
          '&:hover:not([aria-disabled="true"])': { background: bgcHover },
          '&:active:not([aria-disabled="true"])': { background: bgcActive },
        },
      },
      auto: {
        selectors: {
          '&:is(a, button):hover:not([aria-disabled="true"])': { background: bgcHover },
          '&:is(a, button):active:not([aria-disabled="true"])': { background: bgcActive },
        },
      },
    },
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
      const block = vars.component.color[intent][saliency];
      const isLow = saliency === "low";
      const hoverBaseRef = isLow ? vars.component.color[intent].mid.default.bgc : block.default.bgc;
      return {
        variants: { intent, saliency },
        style: {
          vars: {
            [bgc]: block.default.bgc,
            [bgcHover]: isLow ? hoverBaseRef : hover(hoverBaseRef),
            [bgcActive]: active(hoverBaseRef),
            [fg]: block.default.text,
            [bd]: block.default.border,
            [bgcDisabled]: block.disabled.bgc,
            [fgDisabled]: block.disabled.text,
            [bdDisabled]: block.disabled.border,
          },
        },
      };
    }),
  ),
  defaultVariants: {
    interactive: "control",
    intent: "neutral",
    saliency: "mid",
  },
});

export type ComponentIntentVariants = NonNullable<RecipeVariants<typeof componentIntentRecipe>>;

export const componentTypographyRecipe = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: vars.space[2],
    boxSizing: "border-box",
    margin: 0,
    fontFamily: vars.font.sans,
    fontWeight: "500",
    lineHeight: vars.text.size.sm.lineHeight,
    textDecoration: "none",
    whiteSpace: "nowrap",
    borderRadius: vars.component.borderRadius,
    transitionProperty: "background-color, color, border-color, outline-color",
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
    },
  },
  variants: {
    interactive: {
      control: { cursor: "pointer", userSelect: "none" },
      auto: {},
    },
    size: {
      sm: {
        height: sizes.sm.height,
        paddingInline: sizes.sm.px,
        fontSize: sizes.sm.font.fontSize,
      },
      md: {
        height: sizes.md.height,
        paddingInline: sizes.md.px,
        fontSize: sizes.md.font.fontSize,
      },
      lg: {
        height: sizes.lg.height,
        paddingInline: sizes.lg.px,
        fontSize: sizes.lg.font.fontSize,
      },
    },
  },
  defaultVariants: {
    interactive: "control",
    size: "md",
  },
});

export type ComponentTypographyVariants = NonNullable<
  RecipeVariants<typeof componentTypographyRecipe>
>;
