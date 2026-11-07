import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { iconColorVar } from "../../styles/vars.css";
import { vars } from "../../theme/contract.css";

const CONFIRMATION_INTENTS = ["secondary", "warning", "negative"] as const;

export const confirmationModalHeader = style({
  display: "flex",
  alignItems: "flex-start",
  gap: vars.space[3],
});

export const confirmationModalIconRecipe = recipe({
  variants: {
    intent: Object.fromEntries(
      CONFIRMATION_INTENTS.map((intent) => [
        intent,
        { vars: { [iconColorVar]: vars.component.color[intent].high.default.text } },
      ]),
    ) as Record<(typeof CONFIRMATION_INTENTS)[number], { vars: Record<string, string> }>,
  },
  defaultVariants: { intent: "negative" },
});

export type ConfirmationModalIconRecipeVariants = NonNullable<
  RecipeVariants<typeof confirmationModalIconRecipe>
>;

export const confirmationModalIcon = style({
  flexShrink: 0,
  lineHeight: 1,
});
