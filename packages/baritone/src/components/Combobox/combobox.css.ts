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
  sm: { minHeight: "2rem", px: vars.space[2], font: vars.text.size.sm.fontSize },
  md: { minHeight: "2.5rem", px: vars.space[3], font: vars.text.size.md.fontSize },
  lg: { minHeight: "3rem", px: vars.space[4], font: vars.text.size.lg.fontSize },
} as const;

export const wrapper = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
});

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

export const list = style({
  display: "flex",
  flexDirection: "column",
});

export const group = style({
  display: "flex",
  flexDirection: "column",
  selectors: {
    "& + &": { marginTop: vars.space[1] },
  },
});

export const groupLabel = style({
  paddingInline: vars.space[2],
  paddingBlock: vars.space[1],
  fontFamily: vars.font.sans,
  fontSize: vars.text.size.xs.fontSize,
  fontWeight: vars.text.weight.semibold,
  lineHeight: vars.text.size.xs.lineHeight,
  color: vars.text.color.neutral.low,
});

const itemHover = createVar();
const itemActive = createVar();

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
  fontSize: vars.text.size.md.fontSize,
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

export const itemIcon = style({
  display: "inline-flex",
  flexShrink: 0,
  vars: { [iconColorVar]: "currentColor" },
});

export const itemLabel = style({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const itemIndicator = style({
  display: "inline-flex",
  flexShrink: 0,
  color: iconColorVar,
});

export const createPrefix = style({
  color: vars.text.color.neutral.low,
});

export const status = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
  paddingInline: vars.space[2],
  paddingBlock: vars.space[2],
  fontSize: vars.text.size.sm.fontSize,
  color: vars.text.color.neutral.low,
});

export const statusError = style({
  color: vars.text.color.negative.high,
});

export const statusSpinner = style({
  fontSize: vars.text.size.md.fontSize,
  color: vars.text.color.neutral.low,
});

export const virtualViewport = style({
  overflowY: "auto",
  overscrollBehavior: "contain",
});

export const virtualSizer = style({
  position: "relative",
  width: "100%",
});

export const virtualItem = style({
  position: "absolute",
  insetInline: 0,
  boxSizing: "border-box",
});

export const chipsContainer = style({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: vars.space[1],
  flex: 1,
  minWidth: 0,
});

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
  fontSize: vars.text.size.sm.fontSize,
  lineHeight: 1.2,
  maxWidth: "12rem",
});

export const chipLabel = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

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

export const colsVar = createVar();

export const gridList = style([list, { gap: vars.space[1] }]);

export const gridSection = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
});

export const gridRow = style({
  display: "grid",
  gridTemplateColumns: `repeat(${colsVar}, minmax(0, 1fr))`,
  gap: vars.space[1],
});

export const gridItem = style({
  vars: {
    [itemHover]: hover(vars.surface.color.neutral.low.default.bgc),
    [itemActive]: active(vars.surface.color.neutral.low.default.bgc),
  },
  position: "relative",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "2.5rem",
  paddingInline: vars.space[2],
  paddingBlock: vars.space[2],
  borderStyle: "solid",
  borderWidth: vars.borderWidth.thin,
  borderColor: "transparent",
  borderRadius: vars.form.borderRadius,
  fontSize: vars.text.size.md.fontSize,
  color: vars.text.color.neutral.high,
  textAlign: "center",
  cursor: "pointer",
  userSelect: "none",
  scrollMarginBlock: vars.space[1],
  selectors: {
    "&[data-highlighted]": { background: itemHover },
    "&[data-selected]": {
      background: itemActive,
      borderColor: vars.component.color.neutral.low.default.border,
    },
    '&[aria-disabled="true"], &[data-disabled]': {
      opacity: 0.55,
      cursor: "not-allowed",
    },
  },
});

export const gridItemLabel = style({
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const gridItemIndicator = style({
  position: "absolute",
  top: vars.space[1],
  insetInlineEnd: vars.space[1],
  display: "inline-flex",
  fontSize: vars.text.size.xs.fontSize,
  color: iconColorVar,
});

export const gridItemSpan = style({
  gridColumn: "1 / -1",
});

export const gridItemWithIcon = style({
  flexDirection: "column",
  gap: vars.space[1],
});

export const gridItemIcon = style({
  display: "inline-flex",
  vars: { [iconColorVar]: "currentColor" },
});

export const gridItemCaption = style([
  gridItemLabel,
  {
    fontSize: vars.text.size.sm.fontSize,
    color: vars.text.color.neutral.low,
  },
]);
