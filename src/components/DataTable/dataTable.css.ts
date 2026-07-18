import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * The `<table>` itself. Collapsed borders so the shared cell rules read as one
 * grid, full width, and the neutral/mid body text + base body typography as the
 * default for every cell (a cell can still override via its own `Text`/`Link`).
 */
export const dataTableRoot = style({
  width: "100%",
  borderCollapse: "collapse",
  fontFamily: vars.font.sans,
  fontSize: vars.text.variant.body.base.fontSize,
  lineHeight: vars.text.variant.body.base.lineHeight,
  color: vars.text.color.neutral.mid,
  textAlign: "start",
});

/**
 * The `<caption>` — the table's visible title and its accessible name. Sits
 * above the grid (`caption-side: top`), start-aligned, slightly emphasised
 * (neutral/high + semibold) at the small body size.
 */
export const dataTableCaption = style({
  captionSide: "top",
  textAlign: "start",
  paddingBlockEnd: vars.space[3],
  color: vars.text.color.neutral.high,
  fontSize: vars.text.variant.body.sm.fontSize,
  lineHeight: vars.text.variant.body.sm.lineHeight,
  fontWeight: vars.text.weight.semibold,
});

/**
 * One header (`<th>`) or body (`<td>`) cell. The shared padding + bottom divider
 * live in `base`; `align` maps to `text-align` (a real recipe variant, not an
 * inline style, per the house rule that variants are the source of truth); and
 * `header` switches between the stronger header treatment (neutral/high,
 * semibold, thicker rule under the head) and the neutral/mid body cell.
 */
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
        // A heavier rule separates the header from the body.
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
