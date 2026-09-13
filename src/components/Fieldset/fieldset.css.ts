import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

export const fieldsetRoot = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
  margin: 0,
  padding: 0,
  border: "none",
  minInlineSize: 0,
});

export const fieldsetLegend = style({
  padding: 0,
});

export const fieldsetLegendDisabled = style({
  opacity: 0.55,
});
