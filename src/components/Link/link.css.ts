import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";
import { active, hover } from "../../theme/oklch";
import { focusRingColorVar, iconColorVar } from "../../styles/vars.css";

/**
 * Link styling. Unlike "component"/"text", Link has no intent/saliency knob —
 * its colour is locked to the `primary` text token so links read as one
 * consistent colour app-wide. Hover/active derive from it via the same oklch
 * math the component scheme uses; pair with `focusRingRecipe` for the ring.
 */

// The link's resting colour: the primary intent text token.
const linkColor = vars.text.color.primary.mid;

export const linkBase = style({
  // Blend into surrounding copy when used inline (the default, router-agnostic
  // use case is an anchor inside body text).
  fontFamily: "inherit",
  fontSize: "inherit",
  fontWeight: "inherit",
  lineHeight: "inherit",
  color: linkColor,
  // Always underlined: the underline (not colour alone) marks this as a link
  // for users who can't perceive colour; `from-font` keeps the weight legible.
  textDecorationLine: "underline",
  textDecorationThickness: "from-font",
  textUnderlineOffset: "0.15em",
  cursor: "pointer",
  borderRadius: vars.radius.sm,
  // The underline colour follows `currentColor`, so the hover/active colour
  // shift below carries it along; nested `Icon`s track the link colour too.
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
