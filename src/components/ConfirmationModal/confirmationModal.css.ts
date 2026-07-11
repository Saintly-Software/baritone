import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { iconColorVar } from "../../styles/vars.css";
import { vars } from "../../theme/contract.css";

/** The confirm intent is a subset of the full palette (see `ConfirmationIntent`). */
const CONFIRMATION_INTENTS = ["secondary", "warning", "negative"] as const;

/**
 * Header row: the leading `icon` (tinted by intent) sits beside the title/subtitle
 * stack. Aligns to the top so a multi-line title still lines up with the glyph.
 */
export const confirmationModalHeader = style({
  display: "flex",
  alignItems: "flex-start",
  gap: vars.space[3],
});

/**
 * Tints the leading icon to the modal's intent. It republishes `--iconColor` at
 * the intent's high-saliency `component` text token, so the consumer's plain
 * `<Icon>` (which reads that variable) picks up the colour without needing to
 * know the intent. Mirrors `noticeIconRecipe`.
 */
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

/** Keeps the leading icon from shrinking when the title wraps. */
export const confirmationModalIcon = style({
  flexShrink: 0,
  lineHeight: 1,
});
