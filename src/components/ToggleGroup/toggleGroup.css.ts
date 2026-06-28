import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";

/**
 * The group container — a horizontal row of toggle buttons (a segmented set).
 * It owns only layout; every button's box / colour / focus ring comes from the
 * shared `component` recipe through `InternalButton`, so a selected segment reads
 * exactly like a `Button` / `Chip` with the same `intent` x `saliency`.
 */
export const toggleGroupRoot = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space[1],
});

/**
 * Dim the whole group when it's disabled. Disabled is modelled the focusable way
 * (aria-disabled on this container + a veto in the change handler, never the
 * native attribute), so the buttons stay in the roving tab order — this is purely
 * the visual cue. Mirrors `radioGroupDisabled` / `tabsListDisabled`.
 */
export const toggleGroupDisabled = style({
  opacity: 0.55,
});
