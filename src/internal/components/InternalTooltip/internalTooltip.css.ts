import { style } from "@vanilla-extract/css";
import { vars } from "../../../theme/contract.css";

/**
 * Styles for the internal tooltip popup. Kept here (rather than inline in a
 * consumer like `Button`) so every internal use of `InternalTooltip` shares one
 * surface definition.
 */

/**
 * A small neutral surface. Reuses the surface tokens so it themes with
 * everything else, and fades/scales out of the trigger on open and close.
 *
 * `--transform-origin` is published by base-ui's positioner (it points back at
 * the trigger), so the scale animation grows out of the anchor. `position:
 * relative` anchors the absolutely-positioned arrow to this surface.
 */
export const tooltipPopup = style({
  position: "relative",
  maxWidth: "16rem",
  paddingBlock: vars.space[1],
  paddingInline: vars.space[2],
  background: vars.surface.color.neutral.high.default.bgc,
  color: vars.surface.color.neutral.high.default.text,
  borderStyle: "solid",
  borderWidth: vars.borderWidth.thin,
  borderColor: vars.surface.color.neutral.high.default.border,
  borderRadius: vars.radius.sm,
  boxShadow: vars.shadow.md,
  fontFamily: vars.font.sans,
  fontSize: vars.text.variant.body.xs.fontSize,
  lineHeight: vars.text.variant.body.xs.lineHeight,
  transformOrigin: "var(--transform-origin)",
  transitionProperty: "opacity, transform",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    // base-ui flags the enter ("starting") and exit ("ending") frames; fade and
    // scale from the trigger on both so the popup grows in and shrinks out.
    "&[data-starting-style], &[data-ending-style]": {
      opacity: 0,
      transform: "scale(0.96)",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transitionDuration: "0ms",
    },
  },
});

/** Arrow side, in px. base-ui centres it along the edge; we push it out. */
const ARROW_SIZE = 8;
const arrowBorder = `${vars.borderWidth.thin} solid ${vars.surface.color.neutral.high.default.border}`;

/**
 * A rotated square that points the tooltip at its trigger. base-ui positions it
 * along the edge (`position: absolute`, plus the cross-axis offset) and tags it
 * with `data-side`; per side we push it past the edge and expose the two
 * outward-facing borders so it reads as a bordered triangle continuous with the
 * surface. The matching `background` covers the surface border where they meet.
 */
export const tooltipArrow = style({
  width: ARROW_SIZE,
  height: ARROW_SIZE,
  background: vars.surface.color.neutral.high.default.bgc,
  transform: "rotate(45deg)",
  selectors: {
    '&[data-side="top"]': {
      bottom: -ARROW_SIZE / 2,
      borderRight: arrowBorder,
      borderBottom: arrowBorder,
    },
    '&[data-side="bottom"]': {
      top: -ARROW_SIZE / 2,
      borderTop: arrowBorder,
      borderLeft: arrowBorder,
    },
    '&[data-side="left"]': {
      right: -ARROW_SIZE / 2,
      borderTop: arrowBorder,
      borderRight: arrowBorder,
    },
    '&[data-side="right"]': {
      left: -ARROW_SIZE / 2,
      borderBottom: arrowBorder,
      borderLeft: arrowBorder,
    },
  },
});
