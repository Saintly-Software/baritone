import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

/**
 * Lockup root — a horizontal "media object": the icon sits inline with the
 * text block and is centred against the block's full height, so a lone title or
 * a title + subtitle both stay vertically centred on the glyph. The gap is the
 * space between the icon and the text; the text's own title/subtitle spacing is
 * owned by `lockupText`.
 */
export const lockupRoot = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[3],
});

/**
 * The text column — title stacked over subtitle. `minWidth: 0` lets the title
 * and subtitle truncate inside a constrained lockup instead of forcing the row
 * wider than its container.
 */
export const lockupText = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

/**
 * `hideText` — visually hide the text column while keeping it in the accessible
 * tree, so the lockup reads as icon-only but a screen reader still announces the
 * title/subtitle. Taken out of flow (`position: absolute`) so the icon sits on
 * its own without the row's gap reserving space for the collapsed text.
 */
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
