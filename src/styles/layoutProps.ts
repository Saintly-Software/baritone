import type { Atoms } from "./sprinkles.css";

export type WidthShorthand = "fill" | "fit" | "inherit";

const WIDTH: Record<WidthShorthand, NonNullable<Atoms["width"]>> = {
  fill: "full",
  fit: "fit-content",
  inherit: "inherit",
};

export function resolveWidth(width: WidthShorthand | undefined): Atoms["width"] {
  return width ? WIDTH[width] : undefined;
}

export const VISIBILITY_BREAKPOINTS = ["mobile", "sm", "md", "lg", "xl"] as const;
export type VisibilityBreakpoint = (typeof VISIBILITY_BREAKPOINTS)[number];

export type ResponsiveVisibility = VisibilityBreakpoint | VisibilityBreakpoint[];

type ShownDisplay = "flex" | "inline-flex" | "block" | "inline";

function toSet(value: ResponsiveVisibility | undefined): Set<VisibilityBreakpoint> {
  if (value == null) return new Set();
  return new Set(Array.isArray(value) ? value : [value]);
}

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
