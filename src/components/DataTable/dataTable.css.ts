import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

/**
 * The `<table>` itself: collapsed borders so the shared cell rules read as one grid,
 * full width, neutral/mid body text as the default (a cell can override via its own `Text`/`Link`).
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
 * The `<caption>` — the table's visible title and accessible name. Sits above the
 * grid, start-aligned, slightly emphasised (neutral/high + semibold) at the small body size.
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
 * One header (`<th>`) or body (`<td>`) cell. Shared padding + bottom divider live in
 * `base`; `align` maps to `text-align` (a real recipe variant, per the house rule
 * that variants are the source of truth); `header` switches between the stronger
 * header treatment and the neutral/mid body cell.
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
 * Nesting depth of a grouped cell, published as a CSS variable so the group label
 * can indent by `depth × space[4]`. Set per row via `assignInlineVars` (depth is
 * data, not an enumerable variant); read by {@link groupLabel}.
 */
export const groupDepthVar = createVar();

/**
 * A group-header row — one per distinct value of a grouped column, carrying the
 * group's label, count, and expand/collapse toggle. Reads heavier than a body row
 * (subtle neutral fill + neutral/high, semibold text). Fill sits on the `<tr>`;
 * cells stay transparent so it shows through.
 */
export const groupRow = style({
  backgroundColor: vars.surface.color.neutral.low.default.bgc,
  color: vars.text.color.neutral.high,
  fontWeight: vars.text.weight.semibold,
});

/**
 * The label cluster inside a grouped cell — toggle, group value, count, laid out
 * inline. Indents by nesting depth (via {@link groupDepthVar}) so nested groups sit further in.
 */
export const groupLabel = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space[2],
  paddingInlineStart: `calc(${groupDepthVar} * ${vars.space[4]})`,
});

/**
 * The disclosure toggle — a bare, focusable `<button>` (no button chrome) wrapping
 * the chevron. Shared by the group-header and row detail-panel toggles. Sized to a
 * comfortable target; pair with `focusRingRecipe` in the component for the visible ring.
 */
export const disclosureToggle = style({
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
 * The disclosure chevron: points down expanded, rotates to point right collapsed —
 * mirrors `Accordion`'s chevron, honours reduced-motion.
 */
export const groupChevron = style({
  width: "1em",
  height: "1em",
  color: vars.text.color.neutral.low,
  transitionProperty: "transform",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
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

/**
 * A leaf cell's value in the merged label column (`groupDisplay="merge"`), indented
 * by nesting depth (via {@link groupDepthVar}) to line up one level in from its group
 * header. Inline padding, so text alignment and baseline stay untouched.
 */
export const mergeLeafLabel = style({
  paddingInlineStart: `calc(${groupDepthVar} * ${vars.space[4]})`,
});

/**
 * A leading utility column's cell — the selection checkbox and detail-panel expander
 * columns both use it. `width: 1%` + `nowrap` shrinks the column to its control while
 * the shared {@link cell} recipe supplies padding/divider/alignment. One style for
 * both so they can't drift apart.
 */
export const utilityCell = style({
  width: "1%",
  whiteSpace: "nowrap",
});

/**
 * The real `<input type="checkbox">` owning each selection box's state, keyboard,
 * and accessible name. Laid transparently over the presentational `InternalCheckbox`
 * so pointer events (clicks, Shift-click ranges) land on the input, and its focus
 * lights the box's `:focus-within` ring. Hidden via `opacity` (not `display`/
 * `visibility`), so it stays focusable and in the a11y tree.
 *
 * Centred over the box and floored at the WCAG 2.2 (SC 2.5.8) 24px minimum tap
 * target, extending past a smaller visual box without enlarging it.
 */
export const selectionInput = style({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  // `max(…)` covers the box when it is larger, and floors the hit area at 1.5rem
  // (24px) otherwise — the `size="sm"` box is only 1rem, below the a11y minimum.
  width: "max(100%, 1.5rem)",
  height: "max(100%, 1.5rem)",
  margin: 0,
  cursor: "inherit",
  opacity: 0,
});

/**
 * A row's expanded detail panel — the single, full-width `<td>` (spans every column
 * via `colSpan`) on the extra `<tr>` beneath an expanded row. A subtle neutral fill
 * and bottom divider set it off as a nested block; padding gives the consumer's
 * `renderDetailPanel` content room to breathe.
 */
export const detailCell = style({
  padding: vars.space[4],
  backgroundColor: vars.surface.color.neutral.low.default.bgc,
  color: vars.text.color.neutral.mid,
  borderBottomStyle: "solid",
  borderBottomWidth: vars.borderWidth.thin,
  borderBottomColor: vars.surface.color.neutral.low.default.border,
});
