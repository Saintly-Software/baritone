import { createVar, globalStyle, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { FORM_STATES, FORM_STATE_INTENT } from "../../../theme/constants";
import { vars } from "../../../theme/contract.css";
import { active, hover } from "../../../theme/oklch";
import { focusRingColorVar, iconColorVar } from "../../../styles/vars.css";

const bg = createVar();
const bd = createVar();
const accent = createVar();
const bdNow = createVar();
const trackW = createVar();
const thumb = createVar();
const pad = createVar();

export const switchTrack = recipe({
  base: {
    boxSizing: "border-box",
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    flexShrink: 0,
    background: bg,
    color: bdNow,
    borderRadius: vars.radius.full,
    borderStyle: "solid",
    borderWidth: vars.borderWidth.thin,
    borderColor: bdNow,
    cursor: "pointer",
    transitionProperty: "border-color, background-color, color, outline-color",
    transitionDuration: vars.motion.duration.fast,
    transitionTimingFunction: vars.motion.easing.standard,
    vars: { [bdNow]: bd, [pad]: "0.125rem" },
    selectors: {
      "&[data-checked]": { vars: { [bdNow]: accent } },
      "&:hover:not([data-disabled])": {
        background: hover(bg),
        borderColor: hover(bdNow),
        color: hover(bdNow),
      },
      "&:active:not([data-disabled])": {
        background: active(bg),
        borderColor: active(bdNow),
        color: active(bdNow),
      },
      "&[data-disabled]": {
        opacity: 0.55,
        cursor: "not-allowed",
      },
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
              [accent]: vars.form.focus[FORM_STATE_INTENT[state]],
              [focusRingColorVar]: vars.form.focus[FORM_STATE_INTENT[state]],
            },
          },
        ];
      }),
    ) as Record<(typeof FORM_STATES)[number], { vars: Record<string, string> }>,
    size: {
      sm: { width: "1.75rem", height: "1rem", vars: { [trackW]: "1.75rem", [thumb]: "0.625rem" } },
      md: {
        width: "2.25rem",
        height: "1.25rem",
        vars: { [trackW]: "2.25rem", [thumb]: "0.8125rem" },
      },
      lg: { width: "2.75rem", height: "1.5rem", vars: { [trackW]: "2.75rem", [thumb]: "1rem" } },
    },
  },
  defaultVariants: { state: "neutral", size: "md" },
});

export const switchThumb = style({
  position: "absolute",
  left: pad,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: thumb,
  height: thumb,
  borderRadius: vars.radius.full,
  background: "currentColor",
  pointerEvents: "none",
  transitionProperty: "transform",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "&[data-unchecked]": { transform: "translateX(0)" },
    "&[data-checked]": {
      transform: `translateX(calc(${trackW} - ${thumb} - 2 * ${pad} - 2 * ${vars.borderWidth.thin}))`,
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export const switchThumbIcon = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "68%",
  height: "68%",
  color: bg,
  vars: { [iconColorVar]: bg },
  pointerEvents: "none",
});

globalStyle(`${switchThumbIcon} svg`, {
  display: "block",
  width: "100%",
  height: "100%",
});

export type SwitchTrackVariants = NonNullable<RecipeVariants<typeof switchTrack>>;
