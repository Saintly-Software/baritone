import { style } from "@vanilla-extract/css";
import { vars } from "../../theme/contract.css";
import { hover } from "../../theme/oklch";

const FADE = "40px";

const BAR = "10px";

const REVEAL_DELAY = "400ms";

/**
 * Per-edge gradient masks driven by base-ui's overflow metrics. Each
 * `--scroll-area-overflow-<axis>-<edge>` var is the number of pixels of content
 * hidden past that edge of the viewport (0 when you're flush against it), so
 * `min(FADE, …)` fades an edge in only as far as it can actually scroll and
 * leaves a fully-flush edge crisp. Fallbacks of `0px` keep the content sharp
 * before base-ui has measured (SSR / first paint).
 */
const yFade = `linear-gradient(
  to bottom,
  transparent 0,
  #000 min(${FADE}, var(--scroll-area-overflow-y-start, 0px)),
  #000 calc(100% - min(${FADE}, var(--scroll-area-overflow-y-end, 0px))),
  transparent 100%
)`;

const xFade = `linear-gradient(
  to right,
  transparent 0,
  #000 min(${FADE}, var(--scroll-area-overflow-x-start, 0px)),
  #000 calc(100% - min(${FADE}, var(--scroll-area-overflow-x-end, 0px))),
  transparent 100%
)`;

/** Groups every part; sizes to whatever the consumer gives it. */
export const root = style({
  position: "relative",
  boxSizing: "border-box",
  minWidth: 0,
  minHeight: 0,
});

/**
 * The scroll container. base-ui already sets `overflow: scroll` and hides the
 * native scrollbars, so this only fills the root and carries the gradient fade
 * mask (added per-orientation below).
 */
export const viewport = style({
  width: "100%",
  height: "100%",
  overscrollBehavior: "contain",
});

/** Fade the block-start / block-end edges (vertical scrolling). */
export const viewportFadeVertical = style({
  maskImage: yFade,
  maskRepeat: "no-repeat",
});

/** Fade the inline-start / inline-end edges (horizontal scrolling). */
export const viewportFadeHorizontal = style({
  maskImage: xFade,
  maskRepeat: "no-repeat",
});

/**
 * Fade all four edges. Compositing the two axis masks with `intersect` keeps a
 * pixel only where *both* masks keep it, so the corners round off cleanly
 * instead of one axis's fade punching through the other's.
 */
export const viewportFadeBoth = style({
  maskImage: `${yFade}, ${xFade}`,
  maskRepeat: "no-repeat",
  maskComposite: "intersect",
});

/**
 * A scrollbar rail. The rail itself is invisible — only the thumb shows — and
 * the whole thing is hidden until you hover the area or scroll (base-ui flags
 * those with `data-hovering` / `data-scrolling`). Reveal is quick; the fade-out
 * waits out `REVEAL_DELAY` so a resting bar lingers a beat before disappearing.
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

/**
 * The draggable thumb. base-ui sizes its main axis inline (via
 * `--scroll-area-thumb-height` / `-width`); we fill the cross axis and paint a
 * neutral pill that deepens on hover / while dragging.
 */
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
