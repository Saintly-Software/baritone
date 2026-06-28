import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { surfacePaddingVar } from "../../styles/vars.css";
import { vars } from "../../theme/contract.css";

// Negative inset equal to the card's own padding (published by the surface
// recipe as `--surfacePadding`). Used to pull full-bleed content / dividers out
// to the card's edges.
const bleedInline = `calc(${surfacePaddingVar} * -1)`;

/**
 * Card root layout — a vertical stack with even spacing, so the optional
 * `header`, the content, and the optional `footer` lay out top-to-bottom. The
 * `gap` is block-direction only, so it doesn't fight the inline negative margins
 * used by `Card.Bleed` / `Card.Divider`.
 */
export const cardRoot = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
});

/**
 * Header row: a leading group (`icon` + title/subtitle stack) on the start and a
 * trailing group (`chip` + any `children` actions) on the end.
 */
export const cardHeader = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: vars.space[3],
});

/** Leading group — the optional `icon` next to the title/subtitle stack. */
export const cardHeaderLeading = style({
  display: "flex",
  alignItems: "flex-start",
  gap: vars.space[3],
  minWidth: 0,
  flex: "1 1 auto",
});

/** The optional leading icon; never shrinks, sits beside the title. */
export const cardHeaderIcon = style({
  display: "inline-flex",
  flexShrink: 0,
});

export const cardHeaderText = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

/** Trailing group — the optional `chip` and any header `children` (actions). */
export const cardHeaderTrailing = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
  flexShrink: 0,
});

/** Footer row: actions, end-aligned by default. */
export const cardFooter = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: vars.space[2],
});

/**
 * Full-bleed content — negates the card's inline padding so the child touches
 * the left/right edges (e.g. a cover image or full-width list).
 */
export const cardBleed = style({
  marginInline: bleedInline,
});

/** Edge-to-edge divider; spans the full card width by negating inline padding. */
export const cardDivider = style({
  flexShrink: 0,
  border: 0,
  height: vars.borderWidth.thin,
  margin: 0,
  marginInline: bleedInline,
  backgroundColor: vars.surface.color.neutral.low.default.border,
});

/**
 * `Card.Actions` — a row of buttons anchored to one side. `width: 100%` so it
 * fills its container (a `Card.Footer`, a `Card.Row`), and the `side` variant
 * just flips `justify-content`.
 */
export const cardActionsRecipe = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    gap: vars.space[2],
    width: "100%",
  },
  variants: {
    side: {
      start: { justifyContent: "flex-start" },
      end: { justifyContent: "flex-end" },
    },
  },
  defaultVariants: {
    side: "end",
  },
});

export type CardActionsVariants = NonNullable<RecipeVariants<typeof cardActionsRecipe>>;

/** `Card.Rows` — the `<dl>` wrapper; a vertical stack of `Card.Row`s. */
export const cardRows = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
  margin: 0,
  padding: 0,
});

/** One row: term/title on the start, description/actions on the end. */
export const cardRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[4],
});

/** The `<dt>` of a term/description row. */
export const cardRowTerm = style({
  margin: 0,
  minWidth: 0,
});

/** The `<dt>` of a rich row — a title/subtitle stack. */
export const cardRowText = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  margin: 0,
  minWidth: 0,
});

/** The `<dd>` of a term/description row — the value, end-aligned. */
export const cardRowDesc = style({
  margin: 0,
  minWidth: 0,
  textAlign: "end",
});

/** The `<dd>` of a rich row — the trailing actions; never shrinks. */
export const cardRowActions = style({
  margin: 0,
  flexShrink: 0,
});

/**
 * Collapsible root — the surface is applied with `padding: none` (the trigger
 * and panel own their padding, like an `Accordion` item), so `overflow: hidden`
 * here clips the collapsing panel to the card's rounded corners.
 */
export const cardCollapsibleRoot = style({
  overflow: "hidden",
});

/**
 * Republishes `--surfacePadding` so the trigger and panel content can pad
 * themselves with the card's chosen `padding` (the surface itself is `none`).
 * Setting the var on these elements — rather than the root — also keeps
 * `Card.Bleed` / `Card.Divider` working inside the collapsing body.
 */
export const cardCollapsiblePaddingRecipe = recipe({
  variants: {
    padding: {
      none: { vars: { [surfacePaddingVar]: vars.space[0] } },
      sm: { vars: { [surfacePaddingVar]: vars.space[3] } },
      md: { vars: { [surfacePaddingVar]: vars.space[4] } },
      lg: { vars: { [surfacePaddingVar]: vars.space[6] } },
    },
  },
  defaultVariants: {
    padding: "md",
  },
});

/**
 * The disclosure trigger — a full-width row of [header content | chevron].
 * Resets the native button look and adds a subtle neutral wash on hover, like
 * `Accordion`'s trigger. Padding comes from the republished `--surfacePadding`.
 */
export const cardCollapsibleTrigger = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[3],
  width: "100%",
  boxSizing: "border-box",
  margin: 0,
  padding: surfacePaddingVar,
  background: "transparent",
  border: "none",
  color: "inherit",
  fontFamily: "inherit",
  textAlign: "left",
  cursor: "pointer",
  transitionProperty: "background-color, outline-color",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    '&:hover:not([aria-disabled="true"])': {
      background: vars.component.color.neutral.mid.default.bgc,
    },
    '&[aria-disabled="true"]': {
      cursor: "not-allowed",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

/**
 * The disclosure chevron. Muted, decorative, rotated 180° when the panel is
 * open — base-ui flags the open trigger with `data-panel-open`.
 */
export const cardChevron = style({
  flexShrink: 0,
  width: "1.25em",
  height: "1.25em",
  color: vars.text.color.neutral.low,
  transitionProperty: "transform",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "[data-panel-open] &": { transform: "rotate(180deg)" },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

/**
 * The collapsing panel. base-ui publishes the measured content height as
 * `--collapsible-panel-height`; animating `height` to/from `0` (the
 * `data-starting-style` / `data-ending-style` frames) gives the open/close
 * slide. `overflow: hidden` clips the content mid-transition. Padding lives on
 * the inner content wrapper so it can't perturb the animated height.
 */
export const cardCollapsiblePanel = style({
  overflow: "hidden",
  height: "var(--collapsible-panel-height)",
  transitionProperty: "height",
  transitionDuration: vars.motion.duration.base,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "&[data-starting-style], &[data-ending-style]": { height: 0 },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

/**
 * Padded content region inside the panel — a vertical stack (the content, then
 * the optional footer). The top gap to the header comes from the trigger's own
 * bottom padding, so this only pads the inline + bottom edges.
 */
export const cardCollapsiblePanelContent = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
  paddingInline: surfacePaddingVar,
  paddingBottom: surfacePaddingVar,
});
