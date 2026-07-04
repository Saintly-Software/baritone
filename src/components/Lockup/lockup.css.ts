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
