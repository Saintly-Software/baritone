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

/**
 * Per-edge gradient masks driven by base-ui's `--scroll-area-overflow-*` metrics
 * (pixels hidden past each edge, 0 when flush), so a fade appears only on a side
 * that can scroll further. `0px` fallbacks keep content sharp before measurement.
 */
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

/**
 * Groups the viewport, scrollbar, and floating nav buttons. A flex column so a
 * `height` or `max-height` on the root bounds the viewport — which lets a vertical
 * `Overflow` grow to a cap and then scroll (a `height: 100%` viewport can't
 * resolve against a `max-height`-only parent). Horizontal needs only a bounded width.
 */
export const root = style({
  position: "relative",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  maxWidth: "100%",
});

/**
 * The scroll container. base-ui already sets `overflow: scroll` and hides the
 * native scrollbars; this fills the root (as a flex child) and carries the
 * gradient fade mask (added per-orientation below).
 */
export const viewport = style({
  flex: "1 1 auto",
  minWidth: 0,
  minHeight: 0,
  overscrollBehavior: "contain",
});

/** Fade the inline start/end edges (horizontal orientation). */
export const viewportFadeHorizontal = style({
  maskImage: xFade,
  maskRepeat: "no-repeat",
});

/** Fade the block start/end edges (vertical orientation). */
export const viewportFadeVertical = style({
  maskImage: yFade,
  maskRepeat: "no-repeat",
});

/**
 * The layout track holding the controls — a single non-wrapping row (or column).
 * `width: max-content` keeps every control at its intrinsic size so they overflow
 * rather than squash. The `gap` variant is the space between them.
 */
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

/**
 * A scrollbar rail. The rail is invisible — only the thumb shows — and the whole
 * thing stays hidden until you hover the area or scroll (base-ui flags those
 * with `data-hovering` / `data-scrolling`). Reveal is quick; the fade-out waits
 * out `REVEAL_DELAY` so a resting bar lingers a beat. Mirrors `ScrollArea`.
 */
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

/** The draggable thumb — a neutral pill that deepens on hover / while dragging. */
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

/**
 * A floating scroll button — a pointer convenience kept out of the tab order
 * (`tabIndex={-1}`), since the accessible path is Tab. Hidden by default and
 * revealed only when the matching edge overflows (via base-ui's `data-overflow-*`).
 * Show/hide flips `visibility` + `opacity` instantly: we deliberately don't fade
 * it in, since Chrome pins an opacity transition that starts from `visibility:
 * hidden` at 0. Only the hover wash transitions.
 */
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

/** The chevron glyph inside a nav button; rotated per orientation/side below. */
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
