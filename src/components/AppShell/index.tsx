"use client";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import type { Breakpoint } from "../../theme/breakpoints";
import { cx } from "../../utils/cx";
import { useLayoutRegion, type LayoutCorner } from "../Layout";
import {
  appShellFab,
  appShellFabCorner,
  appShellFooter,
  appShellFooterPinned,
  appShellHeader,
  appShellHeaderPinned,
  appShellMain,
  appShellRoot,
  appShellSidebar,
  appShellSidebarHiddenBelow,
  appShellSidebarPinned,
  appShellSkipLink,
} from "./appShell.css";

export interface AppShellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  header?: React.ReactNode;

  sidebar?: React.ReactNode;

  footer?: React.ReactNode;

  fab?: React.ReactNode;

  children: React.ReactNode;

  pinHeader?: boolean;

  pinSidebar?: boolean;

  pinFooter?: boolean;

  fabCorner?: LayoutCorner;

  hideSidebarBelow?: Breakpoint;

  sidebarLabel?: string;

  skipLinkLabel?: string;

  ref?: React.Ref<HTMLDivElement>;
}

export function AppShell({
  header,
  sidebar,
  footer,
  fab,
  children,
  pinHeader = true,
  pinSidebar = true,
  pinFooter = false,
  fabCorner = "bottom-right",
  hideSidebarBelow,
  sidebarLabel,
  skipLinkLabel = "Skip to main content",
  className,
  ref,
  ...rest
}: AppShellProps) {
  const mainId = React.useId();
  const headerRef = useLayoutRegion({ edge: "top", pinned: pinHeader });
  const sidebarRef = useLayoutRegion({ edge: "left", pinned: pinSidebar });
  const footerRef = useLayoutRegion({ edge: "bottom", pinned: pinFooter });
  const fabRef = useLayoutRegion({ corner: fabCorner });

  return (
    <div ref={ref} className={cx(appShellRoot, className)} {...rest}>
      <a
        href={`#${mainId}`}
        className={cx(appShellSkipLink, focusRingRecipe({ type: "visible", offset: "sm" }))}
      >
        {skipLinkLabel}
      </a>
      {header != null && (
        <header ref={headerRef} className={cx(appShellHeader, pinHeader && appShellHeaderPinned)}>
          {header}
        </header>
      )}
      {sidebar != null && (
        <aside
          ref={sidebarRef}
          aria-label={sidebarLabel}
          className={cx(
            appShellSidebar,
            pinSidebar && appShellSidebarPinned,
            hideSidebarBelow && appShellSidebarHiddenBelow[hideSidebarBelow],
          )}
        >
          {sidebar}
        </aside>
      )}
      <main id={mainId} tabIndex={-1} className={appShellMain}>
        {children}
      </main>
      {footer != null && (
        <footer ref={footerRef} className={cx(appShellFooter, pinFooter && appShellFooterPinned)}>
          {footer}
        </footer>
      )}
      {fab != null && (
        <div ref={fabRef} className={cx(appShellFab, appShellFabCorner[fabCorner])}>
          {fab}
        </div>
      )}
    </div>
  );
}

AppShell.displayName = "AppShell";
