import { style } from "@vanilla-extract/css";
import { vars } from "../../../theme/contract.css";

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
  fontSize: vars.text.size.xs.fontSize,
  lineHeight: vars.text.size.xs.lineHeight,
  transformOrigin: "var(--transform-origin)",
  transitionProperty: "opacity, transform",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
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

const ARROW_SIZE = 8;
const arrowBorder = `${vars.borderWidth.thin} solid ${vars.surface.color.neutral.high.default.border}`;

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
