import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

export const checkboxRow = recipe({
  base: {
    display: "inline-flex",
    gap: vars.space[2],
    cursor: "pointer",
    fontFamily: vars.font.sans,
    color: vars.text.color.neutral.high,
    userSelect: "none",
  },
  variants: {
    size: {
      sm: { fontSize: vars.text.size.sm.fontSize },
      md: { fontSize: vars.text.size.md.fontSize },
      lg: { fontSize: vars.text.size.lg.fontSize },
    },
    labelPosition: {
      end: { flexDirection: "row", alignItems: "center" },
      start: { flexDirection: "row-reverse", alignItems: "center" },
      top: { flexDirection: "column-reverse", alignItems: "flex-start", gap: vars.space[1] },
    },
  },
  defaultVariants: { size: "md", labelPosition: "end" },
});

export const checkboxRowDisabled = style({
  cursor: "not-allowed",
});

export const checkboxLabelDisabled = style({
  opacity: 0.55,
});

export type CheckboxRowVariants = NonNullable<RecipeVariants<typeof checkboxRow>>;
