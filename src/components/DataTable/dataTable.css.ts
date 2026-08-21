import { createVar, style } from "@vanilla-extract/css";
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
  fontSize: vars.text.size.md.fontSize,
  lineHeight: vars.text.size.md.lineHeight,
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
  fontSize: vars.text.size.sm.fontSize,
  lineHeight: vars.text.size.sm.lineHeight,
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

/**
 * Nesting depth of a grouped cell, published as a CSS variable so the group
 * label can indent by `depth × space[4]`. Set per row via `assignInlineVars`
 * (the depth is data, not an enumerable variant) and read by {@link groupLabel}.
 */
export const groupDepthVar = createVar();

/**
 * A group-header row — one per distinct value of a grouped column. It carries
 * the group's label, count, and expand/collapse toggle, and reads a touch
 * heavier than a body row (a subtle neutral fill + neutral/high, semibold text)
 * so the hierarchy parses at a glance. The fill sits on the `<tr>`; the cells
 * stay transparent, so it shows through their shared padding and dividers.
 */
export const groupRow = style({
  backgroundColor: vars.surface.color.neutral.low.default.bgc,
  color: vars.text.color.neutral.high,
  fontWeight: vars.text.weight.semibold,
});

/**
 * The label cluster inside a grouped cell — the toggle, the group value, and
 * the count, laid out inline. Indents by nesting depth (via {@link groupDepthVar})
 * so a group nested inside another sits further in than its parent.
 */
export const groupLabel = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space[2],
  paddingInlineStart: `calc(${groupDepthVar} * ${vars.space[4]})`,
});

/**
 * The expand/collapse toggle — a bare, focusable `<button>` (no button chrome)
 * wrapping the disclosure chevron. Sized to a comfortable target; pair it with
 * the shared `focusRingRecipe` in the component for the visible ring.
 */
export const groupToggle = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: "1.25em",
  height: "1.25em",
  margin: 0,
  padding: 0,
  border: 0,
  background: "none",
  color: "inherit",
  cursor: "pointer",
  borderRadius: vars.radius.sm,
});

/**
 * The disclosure chevron. Points down when the group is expanded and rotates a
 * quarter-turn to point right when collapsed — mirroring `Accordion`'s chevron,
 * and honouring reduced-motion.
 */
export const groupChevron = style({
  width: "1em",
  height: "1em",
  color: vars.text.color.neutral.low,
  transitionProperty: "transform",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  // Collapsed by default (points right); the expanded row rotates it back down.
  transform: "rotate(-90deg)",
  selectors: {
    "&[data-expanded]": { transform: "rotate(0deg)" },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

/** The parenthesised row count trailing a group's label — lighter, so the label leads. */
export const groupCount = style({
  color: vars.text.color.neutral.mid,
  fontWeight: vars.text.weight.default,
});
