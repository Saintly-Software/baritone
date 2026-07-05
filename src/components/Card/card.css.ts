import { fallbackVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { focusRingColorVar, surfacePaddingVar } from "../../styles/vars.css";
import { breakpoints } from "../../theme/breakpoints";
import { vars } from "../../theme/contract.css";

/** Bumps the card's internal padding a step up from the `md` breakpoint. */
const cardPaddingBreakpoint = `screen and (min-width: ${breakpoints.md})`;

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
 * The card's internal padding, made responsive (and no longer a prop): the
 * surface's own default padding covers small screens, and this bumps
 * `--surfacePadding` up a step from the `md` breakpoint. Driving it through the
 * same `--surfacePadding` the surface reads keeps `Card.Bleed` / `Card.Divider`
 * in sync at every width.
 */
export const cardResponsivePadding = style({
  "@media": {
    [cardPaddingBreakpoint]: { vars: { [surfacePaddingVar]: vars.space[6] } },
  },
});

/**
 * An interactive (clickable / linkable) card. The card itself stays a plain
 * container — a single real control inside it (the header title, rendered as a
 * link/button) is stretched over the whole surface with an `::after` overlay, the
 * accessible technique from https://inclusive-components.design/cards/. This just
 * needs to be the positioning context for that overlay.
 */
export const cardInteractive = style({
  position: "relative",
});

/**
 * The card's single primary control: the header title rendered as the one real
 * link (or button). It looks exactly like the heading text — inherits the font
 * and colour, no underline, no button chrome — but its `::after` stretches across
 * the whole card so the entire surface is one click target. This avoids making
 * the card's *content* the link's accessible name (the title alone names it) and
 * avoids nesting other controls inside a button/anchor: secondary controls escape
 * the overlay via `position: relative` (see `cardFooter` etc.). The focus ring is
 * drawn on the stretched pseudo, so a keyboard focus outlines the whole card.
 */
export const cardOverlayLink = style({
  display: "inline",
  margin: 0,
  padding: 0,
  background: "none",
  border: "none",
  font: "inherit",
  color: "inherit",
  textAlign: "inherit",
  textDecoration: "none",
  cursor: "pointer",
  selectors: {
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: vars.surface.borderRadius,
    },
    "&:focus-visible": { outline: "none" },
    "&:focus-visible::after": {
      outline: `2px solid ${fallbackVar(focusRingColorVar, "currentColor")}`,
      outlineOffset: "2px",
    },
    '&[aria-disabled="true"]': { cursor: "not-allowed" },
  },
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

/**
 * Trailing group — the optional `chip`, any header `children` (actions), and (in
 * a collapsible card) the disclosure trigger. `position: relative` lifts these
 * above an interactive card's stretched overlay link so they stay clickable.
 */
export const cardHeaderTrailing = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
  flexShrink: 0,
  position: "relative",
});

/**
 * Footer row: actions, end-aligned by default. `position: relative` lifts the
 * footer (and its buttons) above an interactive card's stretched overlay link so
 * they keep their own, independent click targets.
 */
export const cardFooter = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: vars.space[2],
  position: "relative",
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

/**
 * One row: term/title on the start, description/actions on the end. The inline
 * negative margin + matching padding let a `hoverable` row's highlight extend a
 * little past the text on every side (and the block pair grows the hit area)
 * without shifting the content or touching the card edge — so plain rows can
 * light up on hover like a scannable list. A row that carries its own action
 * stays `hoverable: false`: the action's hover is the affordance that matters,
 * and a whole-row wash behind it would just be noise.
 */
export const cardRowRecipe = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: vars.space[4],
    marginInline: `calc(${vars.space[3]} * -1)`,
    paddingInline: vars.space[3],
    marginBlock: `calc(${vars.space[1]} * -1)`,
    paddingBlock: vars.space[1],
    borderRadius: vars.radius.md,
    transitionProperty: "background-color",
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
    },
  },
  variants: {
    hoverable: {
      true: {
        selectors: {
          "&:hover": { background: vars.component.color.neutral.mid.default.bgc },
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    hoverable: false,
  },
});

export type CardRowVariants = NonNullable<RecipeVariants<typeof cardRowRecipe>>;

/**
 * `Card.Layout` — a split content row: a leading title/subtitle text stack on the
 * start and a trailing action on the end, vertically centred. It's the standalone
 * body-content sibling of a rich `Card.Row` (same split), but a plain `<div>` with
 * no `<dl>` / landmark / overlay-link machinery — so a card can simply *be* one.
 */
export const cardLayout = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[4],
});

/** The leading title/subtitle stack of a `Card.Layout`. */
export const cardLayoutText = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

/**
 * The trailing action of a `Card.Layout`; never shrinks. `position: relative`
 * lifts it above an interactive card's stretched overlay link so it stays
 * independently clickable.
 */
export const cardLayoutAction = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
  flexShrink: 0,
  position: "relative",
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

/**
 * The `<dd>` of a rich row — the trailing actions; never shrinks. `position:
 * relative` lifts the actions above an interactive card's overlay link.
 */
export const cardRowActions = style({
  margin: 0,
  flexShrink: 0,
  position: "relative",
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
 * Republishes `--surfacePadding` on the trigger and panel content so they pad
 * themselves (the surface root itself is `padding: none`). Responsive like the
 * flat card — `space[4]` up to the `md` breakpoint, `space[6]` beyond. Setting the
 * var on these elements — rather than the root — also keeps `Card.Bleed` /
 * `Card.Divider` working inside the collapsing body.
 */
export const cardCollapsibleResponsivePadding = style({
  vars: { [surfacePaddingVar]: vars.space[4] },
  "@media": {
    [cardPaddingBreakpoint]: { vars: { [surfacePaddingVar]: vars.space[6] } },
  },
});

/**
 * The collapsible card's header band — holds the `Card.Header` (which lays out
 * the title/subtitle plus the disclosure trigger). Padding comes from the
 * republished `--surfacePadding`. Unlike the old "the whole header is the button"
 * model, only the trigger button toggles, so the rest of the header can carry its
 * own interactive elements.
 */
export const cardCollapsibleHeader = style({
  padding: surfacePaddingVar,
});

/**
 * The disclosure trigger — a compact icon button (the chevron) that sits at the
 * end of the header. Resets the native button look and adds the subtle neutral
 * wash on hover, like `Accordion`'s trigger; `aria-disabled` (never the native
 * attribute) keeps it tabbable while the root vetoes the toggle.
 */
export const cardCollapsibleTriggerButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  margin: 0,
  padding: vars.space[1],
  background: "transparent",
  border: "none",
  borderRadius: vars.radius.sm,
  color: "inherit",
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
