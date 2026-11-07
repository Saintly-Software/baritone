import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

export const tableRoot = style({
  width: "100%",
  borderCollapse: "collapse",
  fontFamily: vars.font.sans,
  fontSize: vars.text.size.md.fontSize,
  lineHeight: vars.text.size.md.lineHeight,
  color: vars.text.color.neutral.mid,
  textAlign: "start",
});

export const tableCaption = style({
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
