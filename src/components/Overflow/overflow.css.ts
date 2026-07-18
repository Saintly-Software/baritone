import { globalStyle, style } from "@vanilla-extract/css";
import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { SPACE_KEYS } from "../../theme/constants";
import { vars } from "../../theme/contract.css";
import { hover } from "../../theme/oklch";

// How far the gradient fade reaches in from a scrollable edge. base-ui publishes
// the exact pixel overflow at each edge on the viewport (the
// `--scroll-area-overflow-*` vars), so `min(FADE, …)` fades an edge in only as
// far as it can actually scroll — a flush edge stays crisp — and never deeper
// than this. Sized a touch wider than a nav button so the button floats *over*
// visibly-fading content rather than a hard cut.
const FADE = "64px";

// The floating nav button's diameter and its inset from the scrolling edge.
const BUTTON = "32px";
const GUTTER = vars.space[1]; // 4px

// The thumb's resting thickness / the scrollbar rail's cross-axis size.
const BAR = "10px";

// How long the scrollbar lingers before fading back out after you stop hovering
// / scrolling. Reveal is near-instant; the delay only applies to the fade-out.
const REVEAL_DELAY = "400ms";

/**
 * Per-edge gradient masks driven by base-ui's overflow metrics, one axis each.
 * Each `--scroll-area-overflow-<axis>-<edge>` var is the pixels of content
 * hidden past that edge (0 when flush), so the fade only appears on a side that
 * can actually scroll further, and tracks the scroll position live. Fallbacks of
 * `0px` keep content sharp before base-ui has measured (SSR / first paint).
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
 * Groups the viewport, scrollbar, and floating nav buttons (the last two are
 * `position: absolute`, so only the viewport is in flow). It's a flex column so
 * the viewport can fill it *and* be constrained by it: a definite `height` or a
 * `max-height` on the root both bound the viewport, which is what lets a vertical
 * `Overflow` grow to a cap and then scroll (a plain `height: 100%` viewport can't
 * resolve against a `max-height`-only parent). A horizontal `Overflow` needs no
 * height — it hugs its row and just wants a bounded width (its container's is
 * enough); a vertical one wants a bounded `height` / `max-height`.
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
 * gradient fade mask (added per-orientation below). The `min-*: 0` pair is
 * load-bearing: it lets the viewport shrink below its content's size on either
 * axis, which is what actually produces the overflow scroll rather than the
 * content forcing the box to grow.
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
 * The layout track holding the controls — a single non-wrapping row (or column)
 * that grows past the viewport and scrolls. `width: max-content` (horizontal)
 * keeps every control at its intrinsic size instead of shrinking to fit, which
 * is the whole point: the controls overflow rather than squash. The `gap`
 * variant is the space between them.
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
        // Fill the viewport's width so centered controls have a box to center
        // in; the column's height grows with content and scrolls.
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
 * A floating scroll button. It's a *pointer convenience* — kept out of the tab
 * order (`tabIndex={-1}` on the element), because the accessible path through a
 * row of controls is Tab, which scrolls each focused control into view on its
 * own. The button is a circular raised surface that floats over the fading edge.
 *
 * Hidden by default (no edge to scroll toward → nothing to show); the reveal
 * rules below light it up only when the matching edge actually overflows, using
 * base-ui's `data-overflow-*` attributes on the root. Show/hide is instant:
 * `visibility` (also dropping it from hit-testing and the accessibility tree
 * when inactive) and `opacity` flip together. We deliberately *don't* fade the
 * button in — the element rests at `visibility: hidden`, and Chrome stalls an
 * opacity transition that starts from a first-painted hidden element, pinning it
 * at 0. The content's edge gradient (the mask below) is the animated affordance;
 * the button just appears. Only the hover wash transitions.
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
  // Hidden resting state (instant flip in the reveal rules below).
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

// --- Placement: pin each button to its edge, centered on the cross axis. ------
// Driven by `data-orientation` on the root + `data-side` on the button, so a
// single `navButton` class covers all four positions.

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

// --- Reveal: light a button up only when its edge actually overflows. ---------
// A horizontal root only ever carries the x-overflow attrs, a vertical root only
// the y-overflow attrs, so these four rules cover both orientations with the
// start/end `data-side` pairing. Specificity (0,4,0) beats the base `navButton`
// class, so these win while the attribute is present.
const revealed = {
  opacity: 1,
  visibility: "visible",
  pointerEvents: "auto",
} as const;

globalStyle(`${root}[data-overflow-x-start] ${navButton}[data-side="start"]`, revealed);
globalStyle(`${root}[data-overflow-x-end] ${navButton}[data-side="end"]`, revealed);
globalStyle(`${root}[data-overflow-y-start] ${navButton}[data-side="start"]`, revealed);
globalStyle(`${root}[data-overflow-y-end] ${navButton}[data-side="end"]`, revealed);

// --- Chevron direction: point the glyph the way the button scrolls. -----------
// The base glyph points right (end of a horizontal row); rotate for the other
// three directions.
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
