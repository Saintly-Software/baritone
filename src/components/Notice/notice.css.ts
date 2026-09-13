import { createVar, fallbackVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { iconColorVar, textColorVar } from "../../styles/vars.css";
import { INTENTS, SALIENCIES, SURFACE_SALIENCIES } from "../../theme/constants";
import { vars } from "../../theme/contract.css";

const bgc = createVar();
const fg = createVar();
const bd = createVar();

const COMPONENT_SALIENCY = { high: "mid", low: "low" } as const;

export const noticeRecipe = recipe({
  base: {
    display: "flex",
    alignItems: "flex-start",
    gap: vars.space[3],
    minWidth: 0,
    minHeight: 0,
    boxSizing: "border-box",
    borderStyle: "solid",
    borderWidth: vars.borderWidth.thin,
    borderColor: bd,
    background: bgc,
    color: fg,
    padding: vars.space[4],
    borderRadius: vars.component.borderRadius,
    vars: { [iconColorVar]: fg, [textColorVar]: fg },
  },
  variants: {
    intent: Object.fromEntries(INTENTS.map((intent) => [intent, {}])) as Record<
      (typeof INTENTS)[number],
      Record<string, never>
    >,
    saliency: Object.fromEntries(SURFACE_SALIENCIES.map((saliency) => [saliency, {}])) as Record<
      (typeof SURFACE_SALIENCIES)[number],
      Record<string, never>
    >,
    shape: {
      square: {},
      pill: { borderRadius: vars.radius.full },
    },
    inline: {
      false: {},
      true: { display: "inline-flex" },
    },
    disabled: {
      false: {},
      true: { opacity: 0.6 },
    },
  },
  compoundVariants: INTENTS.flatMap((intent) =>
    SURFACE_SALIENCIES.map((saliency) => {
      const block = vars.component.color[intent][COMPONENT_SALIENCY[saliency]];
      return {
        variants: { intent, saliency },
        style: {
          vars: {
            [bgc]: block.default.bgc,
            [fg]: block.default.text,
            [bd]: block.default.border,
          },
        },
      };
    }),
  ),
  defaultVariants: {
    intent: "neutral",
    saliency: "high",
    shape: "square",
    inline: false,
    disabled: false,
  },
});

export type NoticeRecipeVariants = NonNullable<RecipeVariants<typeof noticeRecipe>>;

export const noticeBody = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
  flex: 1,
});

export const noticeTitle = style({
  fontWeight: "600",
});

export const noticeHeader = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
  flexWrap: "wrap",
  minWidth: 0,
});

export const noticeActions = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space[2],
  marginTop: vars.space[2],
});

export const noticeIconRecipe = recipe({
  variants: {
    intent: Object.fromEntries(INTENTS.map((intent) => [intent, {}])) as Record<
      (typeof INTENTS)[number],
      Record<string, never>
    >,
    saliency: Object.fromEntries(SALIENCIES.map((saliency) => [saliency, {}])) as Record<
      (typeof SALIENCIES)[number],
      Record<string, never>
    >,
  },
  compoundVariants: INTENTS.flatMap((intent) =>
    SALIENCIES.map((saliency) => ({
      variants: { intent, saliency },
      style: {
        vars: { [iconColorVar]: vars.component.color[intent][saliency].default.text },
      },
    })),
  ),
});

export type NoticeIconRecipeVariants = NonNullable<RecipeVariants<typeof noticeIconRecipe>>;

export const noticeActionRecipe = recipe({
  base: {},
  variants: {
    iconOnly: {
      false: {},
      true: { paddingInline: 0, aspectRatio: "1" },
    },
  },
  defaultVariants: { iconOnly: false },
});

export type NoticeActionRecipeVariants = NonNullable<RecipeVariants<typeof noticeActionRecipe>>;

export const noticeClose = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  boxSizing: "border-box",
  width: "1.5rem",
  height: "1.5rem",
  margin: 0,
  padding: 0,
  border: "none",
  background: "transparent",
  color: fallbackVar(iconColorVar, vars.component.color.neutral.mid.default.text),
  borderRadius: vars.radius.full,
  lineHeight: 0,
  cursor: "pointer",
  opacity: 0.7,
  transitionProperty: "opacity",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    '&:hover:not([aria-disabled="true"])': { opacity: 1 },
    '&[aria-disabled="true"]': { cursor: "not-allowed", opacity: 0.4 },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});
