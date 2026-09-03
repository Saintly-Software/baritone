import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

/**
 * The fieldset container. A native `<fieldset>` ships with a border, margin,
 * asymmetric padding, and a `min-inline-size: min-content` that stops it
 * shrinking in flex/grid — reset here into a simple vertical stack. Spacing
 * between the controls themselves is the caller's concern.
 */
export const fieldsetRoot = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
  margin: 0,
  padding: 0,
  border: "none",
  minInlineSize: 0,
});

/**
 * The legend — the group's visible heading. `<legend>`/base-ui's legend `<div>`
 * has no useful default typography, so it borrows the neutral-high label look
 * form-group labels use (composed in the component); this just holds the spacing.
 */
export const fieldsetLegend = style({
  padding: 0,
});

/**
 * Fades the legend when the fieldset is disabled, matching the 0.55 opacity every
 * disabled control uses. Controls dim themselves via `useIsFieldDisabled`, so the
 * container never stacks an opacity on top — only the legend needs this.
 */
export const fieldsetLegendDisabled = style({
  opacity: 0.55,
});
