import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

export const lockupRoot = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[3],
  minWidth: 0,
  minHeight: 0,
});

export const lockupText = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

export const lockupTextHidden = style({
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
});
