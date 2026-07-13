import { style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "../../theme/contract.css";
import { iconColorVar, textColorVar } from "../../styles/vars.css";

/** `Menu.Item`'s supported intents — the neutral default plus the accent intents. */
const MENU_ITEM_INTENTS = ["neutral", "secondary", "warning", "negative"] as const;

/** base-ui portals the menu to the end of `<body>`, so it stacks above page
 * content by DOM order — no z-index needed (see `BaritoneTheme`'s `isolation`). */
export const menuPositioner = style({
  outline: "none",
});

/**
 * The menu surface — a tight vertical stack of rows. Colour/border/radius come
 * from the shared `surfaceRecipe` (applied in the component with `padding:
 * none`, since each row owns its own padding); this adds the elevation shadow
 * and the open/close transition, mirroring `Popover`'s popup.
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
 * One row's colour scheme: the resolved text/icon colour for its `intent`, and
 * the background wash shown while base-ui flags it `data-highlighted`
 * (keyboard/pointer navigation) — the row's *only* focus indicator, matching
 * base-ui's own recommended pattern (no separate focus ring per item). The
 * `neutral` wash matches `Accordion`'s trigger hover; the accent intents
 * (`secondary`/`warning`/`negative`) use their own tokens so a destructive item
 * reads as such even before it's highlighted.
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
    fontSize: vars.text.variant.body.sm.fontSize,
    lineHeight: vars.text.variant.body.sm.lineHeight,
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
