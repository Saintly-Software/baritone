import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

/**
 * Styles for the internal tooltip popup. Kept here (rather than inline in a
 * consumer like `Button`) so every internal use of `InternalTooltip` shares one
 * surface definition.
 */

/** Sits the tooltip above page content. */
export const tooltipPositioner = style({
  zIndex: vars.zIndex.overlay,
});

/**
 * A small neutral surface. Reuses the surface tokens so it themes with
 * everything else.
 */
export const tooltipPopup = style({
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
});
