import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";
import { active, hover } from "../../theme/oklch";
import { focusRingColorVar, iconColorVar } from "../../styles/vars.css";

/**
 * Link styling. Unlike the "component"/"text" element types, a Link has no
 * intent/saliency knob — its colour is locked to the `primary` text token so
 * links read as one consistent, predictable colour across the app. Hover/active
 * are derived from that token via the same oklch relative-colour math the
 * component scheme uses. Pair with `focusRingRecipe` for the ring.
 */

const linkColor = vars.text.color.primary.mid;

export const linkBase = style({
  fontFamily: "inherit",
  fontSize: "inherit",
  fontWeight: "inherit",
  lineHeight: "inherit",
  color: linkColor,
  textDecorationLine: "underline",
  textDecorationThickness: "from-font",
  textUnderlineOffset: "0.15em",
  cursor: "pointer",
  borderRadius: vars.radius.sm,
  vars: {
    [iconColorVar]: "currentColor",
    [focusRingColorVar]: vars.component.focus.primary,
  },
  transitionProperty: "color, outline-color",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
  selectors: {
    "&:hover": { color: hover(linkColor) },
    "&:active": { color: active(linkColor) },
  },
});
