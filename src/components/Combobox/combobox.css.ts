import { createVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { FORM_STATES, FORM_STATE_INTENT } from "../../theme/constants";
import { vars } from "../../theme/contract.css";
import { active, hover } from "../../theme/oklch";
import { focusRingColorVar, iconColorVar } from "../../styles/vars.css";

const bg = createVar();
const bd = createVar();
const placeholder = createVar();

const sizes = {
  sm: { minHeight: "2rem", px: vars.space[2], font: vars.text.variant.body.sm.fontSize },
  md: { minHeight: "2.5rem", px: vars.space[3], font: vars.text.variant.body.base.fontSize },
  lg: { minHeight: "3rem", px: vars.space[4], font: vars.text.variant.body.lg.fontSize },
} as const;

/** Vertical stack: label, control, description/error — mirrors `TextInput`. */
export const wrapper = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
});

/**
 * The control box (base-ui's `Combobox.InputGroup`): a bordered, form-coloured
 * container that lays the input out in a row alongside the trigger/clear
 * adornments — and, in `multiple` mode, wraps the selected chips before the
 * input. Reuses the shared `form` tokens (background / border / placeholder /
 * focus) exactly like `formControlRecipe`, so it reads a `state` rather than
 * intent/saliency and publishes the focus-ring colour for the paired
 * `focusRingRecipe` (`type: "within"`).
 */
export const control = recipe({
  base: {
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    width: "100%",
    margin: 0,
    fontFamily: vars.font.sans,
    color: vars.text.color.neutral.high,
    background: bg,
    borderStyle: "solid",
    borderWidth: vars.borderWidth.thin,
    borderColor: bd,
    borderRadius: vars.form.borderRadius,
    cursor: "text",
    transitionProperty: "border-color, outline-color",
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    vars: { [iconColorVar]: vars.text.color.neutral.high },
    selectors: {
      '&[aria-disabled="true"]': { opacity: 0.55, cursor: "not-allowed" },
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
    },
  },
  variants: {
    state: Object.fromEntries(
      FORM_STATES.map((state) => {
        const c = vars.form.color[state];
        return [
          state,
          {
            vars: {
              [bg]: c.background,
              [bd]: c.border,
              [placeholder]: c.placeholder,
              [focusRingColorVar]: vars.form.focus[FORM_STATE_INTENT[state]],
            },
          },
        ];
      }),
    ) as Record<(typeof FORM_STATES)[number], { vars: Record<string, string> }>,
    size: {
      sm: { paddingInline: sizes.sm.px, fontSize: sizes.sm.font, gap: vars.space[1] },
      md: { paddingInline: sizes.md.px, fontSize: sizes.md.font, gap: vars.space[2] },
      lg: { paddingInline: sizes.lg.px, fontSize: sizes.lg.font, gap: vars.space[2] },
    },
    /**
     * `single` is a fixed-height row; `multiple` grows to fit wrapped chips
     * (minimum one row tall) and adds vertical padding so the chips don't touch
     * the border.
     */
    layout: {
      single: {},
      multiple: { flexWrap: "wrap", alignItems: "center" },
    },
  },
  compoundVariants: [
    { variants: { size: "sm", layout: "single" }, style: { height: sizes.sm.minHeight } },
    { variants: { size: "md", layout: "single" }, style: { height: sizes.md.minHeight } },
    { variants: { size: "lg", layout: "single" }, style: { height: sizes.lg.minHeight } },
    {
      variants: { size: "sm", layout: "multiple" },
      style: { minHeight: sizes.sm.minHeight, paddingBlock: vars.space[1] },
    },
    {
      variants: { size: "md", layout: "multiple" },
      style: { minHeight: sizes.md.minHeight, paddingBlock: vars.space[1] },
    },
    {
      variants: { size: "lg", layout: "multiple" },
      style: { minHeight: sizes.lg.minHeight, paddingBlock: vars.space[1] },
    },
  ],
  defaultVariants: { state: "neutral", size: "md", layout: "single" },
});

export type ControlVariants = NonNullable<RecipeVariants<typeof control>>;

/**
 * The text input itself — bare (no border/background of its own); the `control`
 * box provides the chrome. Grows to fill the row and can shrink so wrapped chips
 * keep their space in `multiple` mode. Placeholder colour is read from the
 * `--placeholder` var the `control` recipe sets per state.
 */
export const input = style({
  flex: "1 1 4rem",
  minWidth: "4rem",
  margin: 0,
  padding: 0,
  border: "none",
  outline: "none",
  background: "transparent",
  color: "inherit",
  font: "inherit",
  selectors: {
    "&::placeholder": { color: placeholder, opacity: 1 },
  },
});

/** A trigger/clear adornment button: bare, inherits the icon colour, dims when the control is disabled. */
export const adornment = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  padding: 0,
  border: "none",
  background: "transparent",
  color: iconColorVar,
  cursor: "pointer",
  lineHeight: 0,
  selectors: {
    '&[aria-disabled="true"]': { cursor: "not-allowed" },
  },
});

/**
 * The popup surface. Colour/border/padding come from the shared `surfaceRecipe`
 * (applied in the component); this adds elevation, the anchor-matched width, a
 * scroll cap, and a small open/close transition. `--anchor-width` and
 * `--available-height` are published by base-ui's positioner.
 */
export const popup = style({
  boxSizing: "border-box",
  width: "var(--anchor-width)",
  minWidth: "12rem",
  maxHeight: "min(var(--available-height, 18rem), 18rem)",
  padding: vars.space[1],
  overflowY: "auto",
  overscrollBehavior: "contain",
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

/** The list of items — a simple vertical stack. */
export const list = style({
  display: "flex",
  flexDirection: "column",
});

const itemHover = createVar();
const itemActive = createVar();

/**
 * A single option row. Highlighted (`data-highlighted`, keyboard/pointer) and
 * selected (`data-selected`) get washes computed in oklch from the surface
 * background; disabled options dim and go inert (base-ui sets `aria-disabled`).
 */
export const item = style({
  vars: {
    [itemHover]: hover(vars.surface.color.neutral.low.default.bgc),
    [itemActive]: active(vars.surface.color.neutral.low.default.bgc),
  },
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
  paddingInline: vars.space[2],
  paddingBlock: vars.space[2],
  borderRadius: vars.form.borderRadius,
  fontSize: vars.text.variant.body.base.fontSize,
  color: vars.text.color.neutral.high,
  cursor: "pointer",
  userSelect: "none",
  scrollMarginBlock: vars.space[1],
  selectors: {
    "&[data-highlighted]": { background: itemHover },
    "&[data-selected]": { background: itemActive },
    '&[aria-disabled="true"], &[data-disabled]': {
      opacity: 0.55,
      cursor: "not-allowed",
    },
  },
});

/** The label text of an option — takes the remaining width, truncates. */
export const itemLabel = style({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

/** The check indicator column; empty until the option is selected. */
export const itemIndicator = style({
  display: "inline-flex",
  flexShrink: 0,
  color: iconColorVar,
});

/** Muted "Add …" prefix for the free-text create affordance. */
export const createPrefix = style({
  color: vars.text.color.neutral.low,
});

/**
 * Status / empty rows (loading, error, no-results). Muted, centred-ish text;
 * errors switch to the negative colour. Shared padding matches an item row.
 */
export const status = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
  paddingInline: vars.space[2],
  paddingBlock: vars.space[2],
  fontSize: vars.text.variant.body.sm.fontSize,
  color: vars.text.color.neutral.low,
});

export const statusError = style({
  color: vars.text.color.negative.high,
});

/** Inline spinner sizing for the loading status row. */
export const statusSpinner = style({
  fontSize: vars.text.variant.body.base.fontSize,
  color: vars.text.color.neutral.low,
});

/** The scroll viewport for the virtualized list — a fixed window we window into. */
export const virtualViewport = style({
  overflowY: "auto",
  overscrollBehavior: "contain",
});

/** The full-height spacer that gives the scrollbar its true range; rows are absolutely placed inside it. */
export const virtualSizer = style({
  position: "relative",
  width: "100%",
});

/** An absolutely-positioned virtualized row (offset by its `top`). */
export const virtualItem = style({
  position: "absolute",
  insetInline: 0,
  boxSizing: "border-box",
});

/** In `multiple` mode, the wrapping row of selected chips followed by the input. */
export const chipsContainer = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: vars.space[1],
  flex: 1,
  minWidth: 0,
});

/** A selected-value chip in `multiple` mode. */
export const chip = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space[1],
  paddingInlineStart: vars.space[2],
  paddingInlineEnd: vars.space[1],
  paddingBlock: "0.125rem",
  borderStyle: "solid",
  borderWidth: vars.borderWidth.thin,
  borderColor: vars.component.color.neutral.low.default.border,
  borderRadius: vars.radius.full,
  background: vars.component.color.neutral.low.default.bgc,
  color: vars.component.color.neutral.low.default.text,
  fontSize: vars.text.variant.body.sm.fontSize,
  lineHeight: 1.2,
  maxWidth: "12rem",
});

export const chipLabel = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

/** The little ✕ button inside a chip. */
export const chipRemove = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: "1.1em",
  height: "1.1em",
  padding: 0,
  border: "none",
  borderRadius: vars.radius.full,
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  lineHeight: 0,
  selectors: {
    "&:hover": { background: active(vars.component.color.neutral.low.default.bgc) },
  },
});
