import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

export const fieldRoot = recipe({
  base: {
    minWidth: 0,
  },
  variants: {
    labelPosition: {
      top: { flexDirection: "column", gap: vars.space[2] },
      start: { flexDirection: "row", alignItems: "baseline", gap: vars.space[2] },
      end: { flexDirection: "row-reverse", alignItems: "baseline", gap: vars.space[2] },
    },
    fit: {
      fill: { display: "flex" },
      content: { display: "inline-flex" },
    },
  },
  compoundVariants: [
    {
      variants: { fit: "content", labelPosition: "top" },
      style: { alignItems: "flex-start" },
    },
  ],
  defaultVariants: { labelPosition: "top", fit: "fill" },
});

export const fieldStack = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    gap: vars.space[2],
    minWidth: 0,
  },
  variants: {
    labelPosition: {
      top: {},
      start: { flexGrow: 1 },
      end: { flexGrow: 1 },
    },
  },
  defaultVariants: { labelPosition: "top" },
});

export const fieldLabelDisabled = style({
  opacity: 0.55,
});

export const fieldLabelRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[1],
});

export const fieldRequiredMarker = style({
  color: vars.text.color.negative.high,
});

export type FieldRootVariants = NonNullable<RecipeVariants<typeof fieldRoot>>;
