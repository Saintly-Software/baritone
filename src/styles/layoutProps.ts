import type { Atoms } from "./sprinkles.css";

/**
 * Friendly `width` shorthand shared by the layout primitives (`Box`, `Flex`).
 * Reach for `render` + `atoms` (or `style`) when you need a specific value.
 *   - `fill` → `100%`
 *   - `fit` → `fit-content`
 *   - `inherit` → `inherit`
 */
export type WidthShorthand = "fill" | "fit" | "inherit";

const WIDTH: Record<WidthShorthand, NonNullable<Atoms["width"]>> = {
  fill: "full",
  fit: "fit-content",
  inherit: "inherit",
};

/** Map the friendly `width` shorthand to its atoms `width` value. */
export function resolveWidth(width: WidthShorthand | undefined): Atoms["width"] {
  return width ? WIDTH[width] : undefined;
}

/**
 * Responsive-visibility breakpoints. `mobile` is the mobile-first base
 * condition; `sm`/`md`/`lg`/`xl` are `min-width` breakpoints.
 */
export const VISIBILITY_BREAKPOINTS = ["mobile", "sm", "md", "lg", "xl"] as const;
export type VisibilityBreakpoint = (typeof VISIBILITY_BREAKPOINTS)[number];

/** A single breakpoint, or a set of them, for `hideOn` / `showOn`. */
export type ResponsiveVisibility = VisibilityBreakpoint | VisibilityBreakpoint[];

/** The flat `display` keywords a visibility-aware primitive can be shown as. */
type ShownDisplay = "flex" | "inline-flex" | "block" | "inline";

function toSet(value: ResponsiveVisibility | undefined): Set<VisibilityBreakpoint> {
  if (value == null) return new Set();
  return new Set(Array.isArray(value) ? value : [value]);
}

/**
 * Builds the `display` atom for a visibility-aware layout primitive.
 *
 * Returns the plain `shown` value when neither `hideOn` nor `showOn` is set;
 * otherwise a responsive conditional toggling `display: none` per breakpoint.
 * `showOn` shows *only* the listed breakpoints; `hideOn` hides them. With both
 * set, an element is visible only where `showOn` allows and `hideOn` doesn't.
 *
 * Every condition is emitted explicitly (not left to cascade) since the
 * sprinkles conditions are `min-width`, which would otherwise leak a hide into
 * larger breakpoints.
 */
export function resolveDisplay(
  shown: ShownDisplay,
  hideOn?: ResponsiveVisibility,
  showOn?: ResponsiveVisibility,
): Atoms["display"] {
  const hide = toSet(hideOn);
  const show = toSet(showOn);
  if (hide.size === 0 && show.size === 0) return shown;

  const display = {} as Record<VisibilityBreakpoint, ShownDisplay | "none">;
  for (const breakpoint of VISIBILITY_BREAKPOINTS) {
    const visible = (show.size === 0 || show.has(breakpoint)) && !hide.has(breakpoint);
    display[breakpoint] = visible ? shown : "none";
  }
  return display;
}
