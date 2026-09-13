import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

export const dataTableRoot = style({
  width: "100%",
  borderCollapse: "collapse",
  fontFamily: vars.font.sans,
  fontSize: vars.text.size.md.fontSize,
  lineHeight: vars.text.size.md.lineHeight,
  color: vars.text.color.neutral.mid,
  textAlign: "start",
});

export const dataTableCaption = style({
  captionSide: "top",
  textAlign: "start",
  paddingBlockEnd: vars.space[3],
  color: vars.text.color.neutral.high,
  fontSize: vars.text.size.sm.fontSize,
  lineHeight: vars.text.size.sm.lineHeight,
  fontWeight: vars.text.weight.semibold,
});

export const cell = recipe({
  base: {
    paddingBlock: vars.space[3],
    paddingInline: vars.space[4],
    verticalAlign: "middle",
    textAlign: "start",
    borderBottomStyle: "solid",
    borderBottomWidth: vars.borderWidth.thin,
    borderBottomColor: vars.surface.color.neutral.low.default.border,
  },
  variants: {
    align: {
      start: { textAlign: "start" },
      center: { textAlign: "center" },
      end: { textAlign: "end" },
    },
    header: {
      true: {
        color: vars.text.color.neutral.high,
        fontWeight: vars.text.weight.semibold,
        whiteSpace: "nowrap",
        borderBottomWidth: vars.borderWidth.thick,
      },
      false: {
        color: vars.text.color.neutral.mid,
      },
    },
  },
  defaultVariants: {
    align: "start",
    header: false,
  },
});

export type CellVariants = NonNullable<RecipeVariants<typeof cell>>;

export const groupDepthVar = createVar();

export const groupRow = style({
  backgroundColor: vars.surface.color.neutral.low.default.bgc,
  color: vars.text.color.neutral.high,
  fontWeight: vars.text.weight.semibold,
});

export const groupLabel = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space[2],
  paddingInlineStart: `calc(${groupDepthVar} * ${vars.space[4]})`,
});

export const disclosureToggle = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: "1.25em",
  height: "1.25em",
  margin: 0,
  padding: 0,
  border: 0,
  background: "none",
  color: "inherit",
  cursor: "pointer",
  borderRadius: vars.radius.sm,
});

export const groupChevron = style({
  width: "1em",
  height: "1em",
  color: vars.text.color.neutral.low,
  transitionProperty: "transform",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  transform: "rotate(-90deg)",
  selectors: {
    "&[data-expanded]": { transform: "rotate(0deg)" },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export const groupCount = style({
  color: vars.text.color.neutral.mid,
  fontWeight: vars.text.weight.default,
});

export const mergeLeafLabel = style({
  paddingInlineStart: `calc(${groupDepthVar} * ${vars.space[4]})`,
});

export const utilityCell = style({
  width: "1%",
  whiteSpace: "nowrap",
});

export const selectionInput = style({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "max(100%, 1.5rem)",
  height: "max(100%, 1.5rem)",
  margin: 0,
  cursor: "inherit",
  opacity: 0,
});

export const detailCell = style({
  padding: vars.space[4],
  backgroundColor: vars.surface.color.neutral.low.default.bgc,
  color: vars.text.color.neutral.mid,
  borderBottomStyle: "solid",
  borderBottomWidth: vars.borderWidth.thin,
  borderBottomColor: vars.surface.color.neutral.low.default.border,
});
