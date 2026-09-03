import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

/** The accordion container — a vertical stack of items. */
export const accordionRoot = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
  minWidth: 0, // see `Flex`
  minHeight: 0, // see `Flex`
});

/** Dim the whole stack when the group is disabled. */
export const accordionRootDisabled = style({
  opacity: 0.55,
});

/**
 * One item. Colour/border/radius come from `surfaceRecipe` (padding: none, since
 * the trigger/panel own their own); this just clips the panel to the rounded corners.
 */
export const accordionItem = style({
  overflow: "hidden",
  minWidth: 0, // see `Flex`
  minHeight: 0, // see `Flex`
});

/** Dim a single disabled item (only when the group as a whole isn't disabled). */
export const accordionItemDisabled = style({
  opacity: 0.55,
});

/** base-ui renders the header as an `<h3>`; strip the default heading margin. */
export const accordionHeader = style({
  margin: 0,
});

/**
 * The trigger button — a full-width row of [header content | chevron]. Resets the
 * native button look and adds a subtle neutral hover wash, matching `Tabs`.
 */
export const accordionTrigger = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[3],
  width: "100%",
  boxSizing: "border-box",
  margin: 0,
  padding: vars.space[4],
  background: "transparent",
  border: "none",
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
    // Disabled uses `aria-disabled` (never the native attribute), so the trigger
    // stays tabbable; the dim comes from the item/root `*Disabled` classes.
    '&[aria-disabled="true"]': {
      cursor: "not-allowed",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

/**
 * `Accordion.ItemHeader`'s layout inside the trigger: the leading group (optional
 * `icon` + title/subtitle) at the start, the optional `chip` at the end. Grows to
 * fill the trigger (the chevron is its own trailing element).
 */
export const accordionHeaderContent = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[3],
  flex: "1 1 auto",
  minWidth: 0,
});

/** Leading group — the optional `icon` beside the title/subtitle stack. */
export const accordionHeaderLeading = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[3],
  minWidth: 0,
});

/** The optional leading icon; never shrinks, sits beside the title. */
export const accordionHeaderIcon = style({
  display: "inline-flex",
  flexShrink: 0,
});

/** The title/subtitle stack inside the trigger. */
export const accordionHeaderText = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

/** The optional trailing chip; never shrinks, kept clear of the title. */
export const accordionHeaderChip = style({
  display: "inline-flex",
  flexShrink: 0,
});

/**
 * The disclosure chevron: muted, decorative, and rotated 180° when open
 * (base-ui flags the trigger with `data-panel-open`).
 */
export const accordionChevron = style({
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
 * The collapsible panel. base-ui publishes the measured content height as
 * `--accordion-panel-height`; animating `height` to/from `0` (the
 * `data-starting-style`/`data-ending-style` frames) gives the slide, clipped by
 * `overflow: hidden`. Padding lives on the inner wrapper so it can't perturb the height.
 */
export const accordionPanel = style({
  overflow: "hidden",
  height: "var(--accordion-panel-height)",
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

/** Padded content region inside the panel. Top gap comes from the trigger. */
export const accordionPanelContent = style({
  paddingInline: vars.space[4],
  paddingBottom: vars.space[4],
  color: vars.text.color.neutral.high,
});
