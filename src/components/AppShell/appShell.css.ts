import { style, styleVariants } from "@vanilla-extract/css";
import { breakpoints, type Breakpoint } from "../../theme/breakpoints";
import { vars } from "../../theme/contract.css";
import { layoutVars } from "../../theme/layout.css";

export const appShellRoot = style({
  display: "grid",
  gridTemplateAreas: `"header header" "sidebar main" "footer footer"`,
  gridTemplateColumns: "auto minmax(0, 1fr)",
  gridTemplateRows: "auto 1fr auto",
  minHeight: "100dvh",
  isolation: "isolate",
});

export const appShellHeader = style({ gridArea: "header", minWidth: 0 });

export const appShellHeaderPinned = style({
  position: "sticky",
  top: layoutVars.offset,
  zIndex: 1,
});

export const appShellSidebar = style({ gridArea: "sidebar", minWidth: 0 });

export const appShellSidebarPinned = style({
  position: "sticky",
  top: layoutVars.inset.top,
  alignSelf: "start",
  maxHeight: `calc(100dvh - ${layoutVars.inset.top} - ${layoutVars.inset.bottom})`,
  overflowY: "auto",
  zIndex: 1,
});

export const appShellSidebarHiddenBelow = styleVariants(breakpoints, (width: string) => ({
  display: "none",
  "@media": { [`screen and (min-width: ${width})`]: { display: "block" } },
})) as Record<Breakpoint, string>;

export const appShellMain = style({
  gridArea: "main",
  minWidth: 0,
  selectors: { "&:focus": { outline: "none" } },
});

export const appShellFooter = style({ gridArea: "footer", minWidth: 0 });

export const appShellFooterPinned = style({
  position: "sticky",
  bottom: layoutVars.offset,
  zIndex: 1,
});

export const appShellFab = style({
  position: "fixed",
  bottom: `calc(${layoutVars.inset.bottom} + ${vars.space[4]})`,
  zIndex: 2,
});

export const appShellFabCorner = styleVariants({
  "bottom-right": { right: `calc(${layoutVars.inset.right} + ${vars.space[4]})` },
  "bottom-left": { left: `calc(${layoutVars.inset.left} + ${vars.space[4]})` },
});

export const appShellSkipLink = style({
  position: "fixed",
  top: vars.space[2],
  left: vars.space[2],
  zIndex: 3,
  padding: `${vars.space[2]} ${vars.space[3]}`,
  borderRadius: vars.component.borderRadius,
  background: vars.surface.color.neutral.high.default.bgc,
  color: vars.surface.color.neutral.high.default.text,
  transform: `translateY(calc(-100% - 2 * ${vars.space[2]}))`,
  selectors: { "&:focus-visible": { transform: "none" } },
});
