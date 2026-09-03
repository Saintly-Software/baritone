import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import type { Intent } from "../../theme/constants";
import { vars } from "../../theme/contract.css";
import { iconColorVar, textColorVar } from "../../styles/vars.css";

/**
 * `Menu.Item`'s supported intents — `neutral` plus the accent intents.
 * `primary` is deliberately absent: it's the call-to-action colour, and a
 * primary-coloured row would out-shout the menu's own trigger.
 *
 * Exported so `MenuItemIntent` derives from this one list — the type and the
 * recipe's variant keys stay the same set by construction. `satisfies` keeps
 * every member a real `Intent`, making the token lookups below total.
 */
export const MENU_ITEM_INTENTS = [
  "neutral",
  "secondary",
  "warning",
  "negative",
  "positive",
] as const satisfies readonly Intent[];

/** base-ui portals the menu to the end of `<body>`, so it stacks above page
 * content by DOM order — no z-index needed. */
export const menuPositioner = style({
  outline: "none",
});

/**
 * The menu surface — a tight vertical stack of rows. Colour/border/radius come
 * from the shared `surfaceRecipe` (`padding: none`, since each row owns its
 * own); this adds the elevation shadow and open/close transition, mirroring
 * `Popover`'s popup.
 */
export const menuPopup = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
  minWidth: "10rem",
  padding: vars.space[1],
  boxShadow: vars.shadow.lg,
  outline: "none",
  transformOrigin: "var(--transform-origin)",
  transitionProperty: "opacity, transform",
  transitionDuration: "120ms",
  transitionTimingFunction: "ease-out",
  selectors: {
    "&[data-starting-style], &[data-ending-style]": {
      opacity: 0,
      transform: "scale(0.96)",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

/**
 * One row's colour scheme: text/icon colour for its `intent`, and the
 * background wash shown on `data-highlighted` — the row's *only* focus
 * indicator, matching base-ui's recommended pattern. The `neutral` wash
 * matches `Accordion`'s trigger hover; accent intents use their own tokens so
 * a destructive item reads as such even before highlighted.
 */
export const menuItemRecipe = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    gap: vars.space[2],
    width: "100%",
    boxSizing: "border-box",
    margin: 0,
    padding: `${vars.space[2]} ${vars.space[3]}`,
    border: "none",
    borderRadius: vars.component.borderRadius,
    background: "transparent",
    fontFamily: vars.font.sans,
    fontSize: vars.text.size.sm.fontSize,
    lineHeight: vars.text.size.sm.lineHeight,
    fontWeight: "500",
    textAlign: "left",
    textDecoration: "none",
    cursor: "pointer",
    userSelect: "none",
    outline: "none",
    transitionProperty: "background-color",
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    selectors: {
      '&[data-disabled], &[aria-disabled="true"]': {
        cursor: "not-allowed",
        opacity: 0.55,
      },
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
    },
  },
  variants: {
    intent: Object.fromEntries(
      MENU_ITEM_INTENTS.map((intent) => [
        intent,
        {
          color: vars.text.color[intent].mid,
          vars: {
            [iconColorVar]: vars.text.color[intent].mid,
            [textColorVar]: vars.text.color[intent].mid,
          },
          selectors: {
            "&[data-highlighted]": {
              background: vars.component.color[intent].mid.default.bgc,
            },
          },
        },
      ]),
    ) as unknown as Record<(typeof MENU_ITEM_INTENTS)[number], Record<string, unknown>>,
  },
  defaultVariants: {
    intent: "neutral",
  },
});

export type MenuItemVariants = NonNullable<RecipeVariants<typeof menuItemRecipe>>;

/** The optional leading icon; never shrinks, sized to match the row's text. */
export const menuItemIcon = style({
  display: "inline-flex",
  flexShrink: 0,
  width: "1em",
  height: "1em",
});
