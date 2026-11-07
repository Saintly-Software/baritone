import { globalStyle, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { SPACE_KEYS } from "../../theme/constants";
import { vars } from "../../theme/contract.css";
import { hover } from "../../theme/oklch";

const FADE = "64px";

const BUTTON = "32px";
const GUTTER = vars.space[1];

const BAR = "10px";

const REVEAL_DELAY = "400ms";

const xFade = `linear-gradient(
  to right,
  transparent 0,
  #000 min(${FADE}, var(--scroll-area-overflow-x-start, 0px)),
  #000 calc(100% - min(${FADE}, var(--scroll-area-overflow-x-end, 0px))),
  transparent 100%
)`;

const yFade = `linear-gradient(
  to bottom,
  transparent 0,
  #000 min(${FADE}, var(--scroll-area-overflow-y-start, 0px)),
  #000 calc(100% - min(${FADE}, var(--scroll-area-overflow-y-end, 0px))),
  transparent 100%
)`;

export const root = style({
  position: "relative",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  maxWidth: "100%",
});

export const viewport = style({
  flex: "1 1 auto",
  minWidth: 0,
  minHeight: 0,
  overscrollBehavior: "contain",
});

export const viewportFadeHorizontal = style({
  maskImage: xFade,
  maskRepeat: "no-repeat",
});

export const viewportFadeVertical = style({
  maskImage: yFade,
  maskRepeat: "no-repeat",
});

export const track = recipe({
  base: {
    display: "flex",
    boxSizing: "border-box",
  },
  variants: {
    orientation: {
      horizontal: {
        flexDirection: "row",
        alignItems: "center",
        width: "max-content",
      },
      vertical: {
        flexDirection: "column",
        alignItems: "center",
        minWidth: "100%",
        width: "max-content",
      },
    },
    gap: Object.fromEntries(SPACE_KEYS.map((k) => [k, { gap: vars.space[k] }])) as Record<
      (typeof SPACE_KEYS)[number],
      { gap: string }
    >,
  },
  defaultVariants: {
    orientation: "horizontal",
    gap: "2",
  },
});

export type TrackVariants = NonNullable<RecipeVariants<typeof track>>;

export const scrollbar = style({
  display: "flex",
  touchAction: "none",
  userSelect: "none",
  opacity: 0,
  transitionProperty: "opacity",
  transitionDuration: vars.motion.duration.base,
  transitionTimingFunction: vars.motion.easing.standard,
  transitionDelay: REVEAL_DELAY,
  selectors: {
    '&[data-orientation="vertical"]': {
      width: BAR,
      padding: "2px",
    },
    '&[data-orientation="horizontal"]': {
      height: BAR,
      flexDirection: "column",
      padding: "2px",
    },
    "&[data-hovering], &[data-scrolling]": {
      opacity: 1,
      transitionDuration: vars.motion.duration.fast,
      transitionDelay: "0ms",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export const thumb = style({
  width: "100%",
  height: "100%",
  borderRadius: vars.radius.full,
  background: vars.component.color.neutral.low.default.border,
  transitionProperty: "background-color",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "&:hover, &[data-scrolling]": {
      background: hover(vars.component.color.neutral.low.default.border),
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
});

export const navButton = style({
  position: "absolute",
  zIndex: 1,
  display: "grid",
  placeItems: "center",
  boxSizing: "border-box",
  width: BUTTON,
  height: BUTTON,
  padding: 0,
  margin: 0,
  borderRadius: vars.radius.full,
  borderStyle: "solid",
  borderWidth: vars.borderWidth.thin,
  borderColor: vars.surface.color.neutral.low.default.border,
  background: vars.surface.color.neutral.high.default.bgc,
  color: vars.surface.color.neutral.high.default.text,
  boxShadow: vars.shadow.md,
  cursor: "pointer",
  fontSize: "18px",
  lineHeight: 0,
  opacity: 0,
  visibility: "hidden",
  pointerEvents: "none",
  transitionProperty: "background-color",
  transitionDuration: vars.motion.duration.fast,
  transitionTimingFunction: vars.motion.easing.standard,
  selectors: {
    "&:hover": {
      background: hover(vars.surface.color.neutral.high.default.bgc),
    },
    "&:focus-visible": {
      outline: `2px solid ${vars.surface.focus.neutral}`,
      outlineOffset: "2px",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transitionDuration: "0s",
    },
  },
});

export const navChevron = style({
  width: "1em",
  height: "1em",
  display: "block",
});

globalStyle(`${root}[data-orientation="horizontal"] ${navButton}[data-side="start"]`, {
  left: GUTTER,
  top: "50%",
  transform: "translateY(-50%)",
});
globalStyle(`${root}[data-orientation="horizontal"] ${navButton}[data-side="end"]`, {
  right: GUTTER,
  top: "50%",
  transform: "translateY(-50%)",
});
globalStyle(`${root}[data-orientation="vertical"] ${navButton}[data-side="start"]`, {
  top: GUTTER,
  left: "50%",
  transform: "translateX(-50%)",
});
globalStyle(`${root}[data-orientation="vertical"] ${navButton}[data-side="end"]`, {
  bottom: GUTTER,
  left: "50%",
  transform: "translateX(-50%)",
});

const revealed = {
  opacity: 1,
  visibility: "visible",
  pointerEvents: "auto",
} as const;

globalStyle(`${root}[data-overflow-x-start] ${navButton}[data-side="start"]`, revealed);
globalStyle(`${root}[data-overflow-x-end] ${navButton}[data-side="end"]`, revealed);
globalStyle(`${root}[data-overflow-y-start] ${navButton}[data-side="start"]`, revealed);
globalStyle(`${root}[data-overflow-y-end] ${navButton}[data-side="end"]`, revealed);

globalStyle(
  `${root}[data-orientation="horizontal"] ${navButton}[data-side="start"] ${navChevron}`,
  {
    transform: "rotate(180deg)",
  },
);
globalStyle(`${root}[data-orientation="vertical"] ${navButton}[data-side="start"] ${navChevron}`, {
  transform: "rotate(-90deg)",
});
globalStyle(`${root}[data-orientation="vertical"] ${navButton}[data-side="end"] ${navChevron}`, {
  transform: "rotate(90deg)",
});
