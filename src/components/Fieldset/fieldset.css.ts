import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

/**
 * The fieldset container. A native `<fieldset>` ships with a border, margin, and
 * asymmetric padding (plus a `min-inline-size: min-content` that stops it from
 * shrinking in flex/grid layouts) — none of which we want. Reset all of that and
 * lay the legend + grouped controls out as a simple vertical stack; spacing
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
 * has no useful default typography, so it borrows the same neutral-high body
 * label look the form-group labels use (composed from the text recipes in the
 * component). This holds only the spacing tweak.
 */
export const fieldsetLegend = style({
  padding: 0,
});

/**
 * Fade the legend when the fieldset is disabled, matching the 0.55 opacity every
 * disabled control uses for its own label. The controls dim themselves (they read
 * the inherited disabled state via `useIsFieldDisabled`), so the container never
 * stacks an opacity on top of them — only the legend needs this.
 */
export const fieldsetLegendDisabled = style({
  opacity: 0.55,
});
