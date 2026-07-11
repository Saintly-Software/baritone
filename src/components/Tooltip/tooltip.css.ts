import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

/**
 * When `content` is a `string[]`, each entry is its own line. A tight vertical
 * stack keeps multi-line hints readable without turning the tooltip into a
 * paragraph (that's `Popover`'s job).
 */
export const tooltipLines = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
});
