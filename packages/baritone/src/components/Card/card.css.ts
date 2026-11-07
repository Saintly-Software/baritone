import { fallbackVar, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { focusRingColorVar, surfacePaddingVar } from "../../styles/vars.css";
import { breakpoints } from "../../theme/breakpoints";
import { vars } from "../../theme/contract.css";

const cardPaddingBreakpoint = `screen and (min-width: ${breakpoints.md})`;

const bleedInline = `calc(${surfacePaddingVar} * -1)`;

export const cardRoot = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
  minWidth: 0,
  minHeight: 0,
});

export const cardResponsivePadding = style({
  "@media": {
    [cardPaddingBreakpoint]: { vars: { [surfacePaddingVar]: vars.space[6] } },
  },
});

export const cardInteractive = style({
  position: "relative",
});

export const cardOverlayLink = style({
  display: "inline",
  margin: 0,
  padding: 0,
  background: "none",
  border: "none",
  font: "inherit",
  color: "inherit",
  textAlign: "inherit",
  textDecoration: "none",
  cursor: "pointer",
  selectors: {
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: vars.surface.borderRadius,
    },
    "&:focus-visible": { outline: "none" },
    "&:focus-visible::after": {
      outline: `2px solid ${fallbackVar(focusRingColorVar, "currentColor")}`,
      outlineOffset: "2px",
    },
    '&[aria-disabled="true"]': { cursor: "not-allowed" },
  },
});

export const cardSelectedRecipe = recipe({
  variants: {
    selected: {
      false: {},
      true: {
        boxShadow: `inset 0 0 0 ${vars.borderWidth.thin} ${vars.surface.focus.primary}`,
        selectors: {
          "&&": { borderColor: vars.surface.focus.primary },
        },
        "@media": {
          "(forced-colors: active)": {
            selectors: { "&&": { borderColor: "Highlight" } },
          },
        },
      },
    },
  },
  defaultVariants: { selected: false },
});

export type CardSelectedVariants = NonNullable<RecipeVariants<typeof cardSelectedRecipe>>;

export const cardHeader = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: vars.space[3],
});

export const cardHeaderLeading = style({
  display: "flex",
  alignItems: "flex-start",
  gap: vars.space[3],
  minWidth: 0,
  flex: "1 1 auto",
});

export const cardHeaderIcon = style({
  display: "inline-flex",
  flexShrink: 0,
});

export const cardHeaderText = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

export const cardHeaderTrailing = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
  flexShrink: 0,
  position: "relative",
});

export const cardFooter = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: vars.space[2],
  position: "relative",
});

export const cardBleed = style({
  marginInline: bleedInline,
});

export const cardDivider = style({
  flexShrink: 0,
  border: 0,
  height: vars.borderWidth.thin,
  margin: 0,
  marginInline: bleedInline,
  backgroundColor: vars.surface.color.neutral.low.default.border,
});

export const cardActionsRecipe = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    gap: vars.space[2],
    width: "100%",
  },
  variants: {
    side: {
      start: { justifyContent: "flex-start" },
      end: { justifyContent: "flex-end" },
    },
  },
  defaultVariants: {
    side: "end",
  },
});

export type CardActionsVariants = NonNullable<RecipeVariants<typeof cardActionsRecipe>>;

export const cardRows = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
  margin: 0,
  padding: 0,
});

export const cardRowRecipe = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: vars.space[4],
    marginInline: `calc(${vars.space[3]} * -1)`,
    paddingInline: vars.space[3],
    marginBlock: `calc(${vars.space[1]} * -1)`,
    paddingBlock: vars.space[1],
    borderRadius: vars.radius.md,
    transitionProperty: "background-color",
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
    },
  },
  variants: {
    hoverable: {
      true: {
        selectors: {
          "&:hover": { background: vars.component.color.neutral.mid.default.bgc },
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    hoverable: false,
  },
});

export type CardRowVariants = NonNullable<RecipeVariants<typeof cardRowRecipe>>;

export const cardLayout = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[4],
});

export const cardLayoutText = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: 0,
});

export const cardLayoutAction = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
  flexShrink: 0,
  position: "relative",
});

export const cardRowTerm = style({
  margin: 0,
  minWidth: 0,
});

export const cardRowText = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  margin: 0,
  minWidth: 0,
});

export const cardRowDesc = style({
  margin: 0,
  minWidth: 0,
  textAlign: "end",
});

export const cardRowActions = style({
  margin: 0,
  flexShrink: 0,
  position: "relative",
});

export const cardCollapsibleRoot = style({
  overflow: "hidden",
});

export const cardCollapsibleResponsivePadding = style({
  vars: { [surfacePaddingVar]: vars.space[4] },
  "@media": {
    [cardPaddingBreakpoint]: { vars: { [surfacePaddingVar]: vars.space[6] } },
  },
});

export const cardCollapsibleHeader = style({
  padding: surfacePaddingVar,
});

export const cardCollapsibleTriggerButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  margin: 0,
  padding: vars.space[1],
  background: "transparent",
  border: "none",
  borderRadius: vars.radius.sm,
  color: "inherit",
  cursor: "pointer",
  transitionProperty: "background-color, outline-color",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    '&:hover:not([aria-disabled="true"])': {
      background: vars.component.color.neutral.mid.default.bgc,
    },
    '&[aria-disabled="true"]': {
      cursor: "not-allowed",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export const cardChevron = style({
  flexShrink: 0,
  width: "1.25em",
  height: "1.25em",
  color: vars.text.color.neutral.low,
  transitionProperty: "transform",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "[data-panel-open] &": { transform: "rotate(180deg)" },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export const cardCollapsiblePanel = style({
  overflow: "hidden",
  height: "var(--collapsible-panel-height)",
  transitionProperty: "height",
  transitionDuration: vars.motion.duration.base,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "&[data-starting-style], &[data-ending-style]": { height: 0 },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export const cardCollapsiblePanelContent = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
  paddingInline: surfacePaddingVar,
  paddingBottom: surfacePaddingVar,
});
