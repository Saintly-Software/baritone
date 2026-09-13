import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";

const chevronZone = "1.25rem";
const clearZone = "1.5rem";

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

export const selectTriggerRow = style({
  position: "relative",
});

export const selectValue = style({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  textAlign: "start",
  selectors: {
    "&[data-placeholder]": { color: vars.text.color.neutral.low },
  },
});

export const selectEndAdornments = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space[1],
  flexShrink: 0,
});

export const selectClearSlot = style({
  width: clearZone,
  height: clearZone,
  flexShrink: 0,
});

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

export const selectSpinner = style({
  flexShrink: 0,
  fontSize: chevronZone,
});

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
    size: {
      sm: { right: `calc(${vars.space[2]} + ${chevronZone} + ${vars.space[1]})` },
      md: { right: `calc(${vars.space[3]} + ${chevronZone} + ${vars.space[1]})` },
      lg: { right: `calc(${vars.space[4]} + ${chevronZone} + ${vars.space[1]})` },
    },
  },
  defaultVariants: { size: "md" },
});

export type SelectClearButtonVariants = NonNullable<RecipeVariants<typeof selectClearButton>>;

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

export const selectList = style({
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  padding: vars.space[1],
});

export const selectGroup = style({
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  selectors: {
    "& + &": { marginTop: vars.space[1] },
  },
});

export const selectGroupLabel = style({
  paddingInline: vars.space[3],
  paddingBlock: vars.space[1],
  fontFamily: vars.font.sans,
  fontSize: vars.text.size.xs.fontSize,
  fontWeight: vars.text.weight.semibold,
  lineHeight: vars.text.size.xs.lineHeight,
  color: vars.text.color.neutral.low,
});

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

export const selectItemText = style({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export const selectItemIndicator = style({
  display: "inline-flex",
  flexShrink: 0,
  fontSize: "1.1em",
});
