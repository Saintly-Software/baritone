"use client";
import * as React from "react";
import {
  EMPTY_INSETS,
  FAB_VAR,
  LayoutRegistry,
  type LayoutCorner,
  type LayoutInsets,
  type LayoutRegionOptions,
} from "./registry";

export type {
  LayoutCorner,
  LayoutCornerRegionOptions,
  LayoutEdge,
  LayoutEdgeRegionOptions,
  LayoutInsets,
  LayoutRegionOptions,
  LayoutSize,
} from "./registry";

export interface LayoutFabReservation {
  corner: LayoutCorner;

  width: number | string;

  height: number | string;
}

const LayoutRegistryContext = React.createContext<LayoutRegistry | null>(null);

const toLength = (value: number | string) => (typeof value === "number" ? `${value}px` : value);

export function fabReservationCss(fab: LayoutFabReservation | readonly LayoutFabReservation[]) {
  const reservations: readonly LayoutFabReservation[] = Array.isArray(fab) ? fab : [fab];
  const declarations = reservations.flatMap(({ corner, width, height }) => [
    `${FAB_VAR[corner].width}:${toLength(width)}`,
    `${FAB_VAR[corner].height}:${toLength(height)}`,
  ]);
  return `:root{${declarations.join(";")}}`;
}

export interface LayoutRegistryProviderProps {
  children: React.ReactNode;

  fab?: LayoutFabReservation | readonly LayoutFabReservation[];
}

export function LayoutRegistryProvider({ children, fab }: LayoutRegistryProviderProps) {
  const [registry] = React.useState(() => new LayoutRegistry());

  React.useEffect(() => {
    registry.connect();
    return registry.disconnect;
  }, [registry]);

  const fabCss = fab === undefined ? undefined : fabReservationCss(fab);
  React.useEffect(() => {
    registry.schedule();
  }, [registry, fabCss]);

  return (
    <LayoutRegistryContext.Provider value={registry}>
      {fabCss !== undefined && <style data-baritone-layout="">{fabCss}</style>}
      {children}
    </LayoutRegistryContext.Provider>
  );
}

export function useLayoutRegion(options: LayoutRegionOptions): React.RefCallback<HTMLElement> {
  const registry = React.useContext(LayoutRegistryContext);
  const edge = "edge" in options ? options.edge : undefined;
  const pinned = "edge" in options ? options.pinned : undefined;
  const order = "edge" in options ? options.order : undefined;
  const corner = "corner" in options ? options.corner : undefined;

  return React.useCallback(
    (element: HTMLElement | null) => {
      if (element === null || registry === null) return;
      const normalized: LayoutRegionOptions =
        edge !== undefined ? { edge, pinned, order } : { corner: corner as LayoutCorner };
      return registry.register(element, normalized);
    },
    [registry, edge, pinned, order, corner],
  );
}

const subscribeNone = () => () => {};
const getEmpty = () => EMPTY_INSETS;

export function useLayoutInsets(): LayoutInsets {
  const registry = React.useContext(LayoutRegistryContext);
  return React.useSyncExternalStore(
    registry?.subscribe ?? subscribeNone,
    registry?.getSnapshot ?? getEmpty,
    getEmpty,
  );
}
