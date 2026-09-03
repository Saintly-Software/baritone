import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

// The trigger's trailing zone holds the chevron (or, when busy, a spinner).
// The clear button shares that footprint, floated just inside it.
const chevronZone = "1.25rem";
const clearZone = "1.5rem";

/**
 * Layout layer over the shared `formControlRecipe`: adds the flex row (value
 * on the start, chevron on the end) and start-aligned text a `<button>`
 * trigger needs but the base input recipe doesn't provide. Colour, sizing,
 * border, and `aria-disabled` dimming all come from `formControlRecipe`.
 */
export const selectTrigger = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
  textAlign: "start",
  cursor: "pointer",
  appearance: "none",
  selectors: {
    '&[aria-busy="true"]': { cursor: "progress" },
  },
});

/** Positions the absolutely-placed clear button relative to the trigger. */
export const selectTriggerRow = style({
  position: "relative",
});

/** The selected label (or placeholder), truncated with an ellipsis. */
export const selectValue = style({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  textAlign: "start",
  selectors: {
    // base-ui flags the placeholder state; dim it like an input's placeholder.
    "&[data-placeholder]": { color: vars.text.color.neutral.low },
  },
});

/** Trailing group: the reserved clear slot (if any) then the chevron/spinner. */
export const selectEndAdornments = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space[1],
  flexShrink: 0,
});

/**
 * An empty, in-flow spacer the size of the clear button — keeps the chevron
 * pinned to the trigger's end and lets the value text truncate before the
 * (absolutely-positioned) clear button, with no per-size padding maths.
 */
export const selectClearSlot = style({
  width: clearZone,
  height: clearZone,
  flexShrink: 0,
});

/** Disclosure chevron. Rotates when the popup is open (base-ui sets the attr). */
export const selectIcon = style({
  display: "inline-flex",
  flexShrink: 0,
  fontSize: chevronZone,
  transitionProperty: "transform",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "&[data-popup-open]": { transform: "rotate(180deg)" },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

/** The busy spinner shown in the chevron's place while `loading`. */
export const selectSpinner = style({
  flexShrink: 0,
  fontSize: chevronZone,
});

/**
 * The clear button, floated over the reserved slot just inside the chevron.
 * Sits outside the trigger `<button>` — a button can't nest a button — as a
 * sibling in `selectTriggerRow`, with a per-size `right` inset.
 */
export const selectClearButton = recipe({
  base: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: clearZone,
    height: clearZone,
    padding: 0,
    border: "none",
    background: "transparent",
    borderRadius: vars.radius.full,
    cursor: "pointer",
    color: vars.text.color.neutral.low,
    transitionProperty: "background-color, color",
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      "&:hover": {
        color: vars.text.color.neutral.high,
        background: vars.surface.color.neutral.high.default.bgc,
      },
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
    },
  },
  variants: {
    // `right` = inline padding + chevron zone + gap, so the clear button
    // sits exactly over its reserved slot for each size.
    size: {
      sm: { right: `calc(${vars.space[2]} + ${chevronZone} + ${vars.space[1]})` },
      md: { right: `calc(${vars.space[3]} + ${chevronZone} + ${vars.space[1]})` },
      lg: { right: `calc(${vars.space[4]} + ${chevronZone} + ${vars.space[1]})` },
    },
  },
  defaultVariants: { size: "md" },
});

export type SelectClearButtonVariants = NonNullable<RecipeVariants<typeof selectClearButton>>;

/**
 * The popup surface. Colour/border/radius come from the shared
 * `surfaceRecipe`; this adds the elevation shadow, anchor-driven sizing, the
 * scroll region, and the open/close transition. Inner padding lives on
 * `selectList` so it never fights the surface's own padding.
 */
export const selectPopup = style({
  boxSizing: "border-box",
  minWidth: "var(--anchor-width)",
  maxHeight: "var(--available-height)",
  overflowY: "auto",
  boxShadow: vars.shadow.lg,
  transformOrigin: "var(--transform-origin)",
  transitionProperty: "opacity, transform",
  transitionDuration: "120ms",
  transitionTimingFunction: "ease-out",
  selectors: {
    "&[data-starting-style], &[data-ending-style]": {
      opacity: 0,
      transform: "scale(0.98)",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

/** The option list. Owns the popup's inner padding and the row gap. */
export const selectList = style({
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  padding: vars.space[1],
});

/**
 * A group of related options (base-ui's `Select.Group`) — a layout wrapper;
 * the visible heading is `selectGroupLabel`. Consecutive groups get a little
 * breathing room above their heading (the first sits flush with the popup's
 * own padding).
 */
export const selectGroup = style({
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  selectors: {
    "& + &": { marginTop: vars.space[1] },
  },
});

/**
 * The group heading (base-ui's `Select.GroupLabel`) — a small, muted,
 * semibold eyebrow aligned to the same inline padding as an option row, so
 * it reads as a section header rather than a selectable row.
 */
export const selectGroupLabel = style({
  paddingInline: vars.space[3],
  paddingBlock: vars.space[1],
  fontFamily: vars.font.sans,
  fontSize: vars.text.size.xs.fontSize,
  fontWeight: vars.text.weight.semibold,
  lineHeight: vars.text.size.xs.lineHeight,
  color: vars.text.color.neutral.low,
});

/**
 * One option row. Highlighted/selected rows take the washed neutral
 * surface; disabled rows dim and go inert. `size` scales font and padding
 * to match the trigger.
 */
export const selectItem = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    gap: vars.space[2],
    borderRadius: vars.form.borderRadius,
    cursor: "pointer",
    userSelect: "none",
    outline: "none",
    color: vars.text.color.neutral.high,
    fontFamily: vars.font.sans,
    selectors: {
      "&[data-highlighted], &[data-selected]": {
        background: vars.surface.color.neutral.high.default.bgc,
      },
      '&[aria-disabled="true"], &[data-disabled]': {
        opacity: 0.55,
        cursor: "not-allowed",
      },
    },
  },
  variants: {
    size: {
      sm: {
        paddingBlock: vars.space[1],
        paddingInline: vars.space[2],
        fontSize: vars.text.size.sm.fontSize,
      },
      md: {
        paddingBlock: vars.space[2],
        paddingInline: vars.space[3],
        fontSize: vars.text.size.md.fontSize,
      },
      lg: {
        paddingBlock: vars.space[2],
        paddingInline: vars.space[3],
        fontSize: vars.text.size.lg.fontSize,
      },
    },
  },
  defaultVariants: { size: "md" },
});

export type SelectItemVariants = NonNullable<RecipeVariants<typeof selectItem>>;

/** The option label; truncates so long labels don't blow out the popup width. */
export const selectItemText = style({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

/** Trailing check on the selected option (single-select only). */
export const selectItemIndicator = style({
  display: "inline-flex",
  flexShrink: 0,
  fontSize: "1.1em",
});
