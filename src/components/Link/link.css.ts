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
  // Always underlined: the underline — not the colour alone — is what marks the
  // text as a link, so it stays distinguishable for users who can't perceive
  // the colour difference. `from-font` keeps the rule weight legible.
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
