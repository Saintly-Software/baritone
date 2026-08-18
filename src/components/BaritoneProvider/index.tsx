"use client";
import { Toast as BaseToast } from "@base-ui/react/toast";
import type { ToastManager } from "@base-ui/react/toast";
import * as React from "react";
import { ToastViewport } from "../Toast";
import type { BaritoneToastManager } from "../Toast";

export interface BaritoneProviderProps {
  children: React.ReactNode;
  /**
   * Default milliseconds before a toast auto-dismisses. `0` keeps toasts until
   * they're dismissed. Overridable per toast via `add({ timeout })`. base-ui
   * default `5000`.
   */
  toastTimeout?: number;
  /**
   * Maximum number of toasts shown at once. Older ones past the limit are kept
   * mounted but hidden (so they can animate away) until they expire. base-ui
   * default `3`.
   */
  toastLimit?: number;
  /**
   * A toast manager for firing toasts from outside React (module scope, a store,
   * an interceptor). Usually unnecessary — `useToast()` covers in-component use.
   * Prefer Baritone's `createToastManager()`, whose `add`/`update`/… take the
   * design-system fields at the top level; a raw base-ui `ToastManager` is also
   * accepted (the provider only reads its subscription channel).
   */
  toastManager?: BaritoneToastManager | ToastManager;
}

/**
 * BaritoneProvider — the client-side application provider for the design system.
 * Wrap your app in it once (inside your `BaritoneTheme`) and the global client
 * services it owns are set up for the whole tree.
 *
 * Today it sets up the **toast system**: it renders base-ui's `Toast.Provider`
 * around your app *and* mounts the toast viewport for you, so calling
 * `useToast().add(...)` anywhere below just works — there's no separate viewport
 * to place. It's the deliberate client-side counterpart to `BaritoneTheme`, which
 * stays a pure, server-renderable token wrapper (so it can live in an SSR root
 * layout); anything needing React state/context lives here instead.
 *
 * The viewport portals to `<body>`, so — like every other portalled surface in
 * the system (`Modal`/`Drawer`/`Popover`) — it resolves its theme tokens from the
 * theme class on `<body>`. Apply your `BaritoneTheme` such that `<body>` carries
 * the theme (e.g. `render={<body />}`) so toasts are themed too.
 *
 * @example
 * // App root (a client component)
 * <BaritoneTheme tokens={tokens} scheme="light" render={<body />}>
 *   <BaritoneProvider>
 *     <App />
 *   </BaritoneProvider>
 * </BaritoneTheme>
 *
 * // Anywhere below
 * const toast = useToast();
 * toast.add({ title: "Copied to clipboard", intent: "positive" });
 */
export function BaritoneProvider({
  children,
  toastTimeout,
  toastLimit,
  toastManager,
}: BaritoneProviderProps) {
  return (
    <BaseToast.Provider
      timeout={toastTimeout}
      limit={toastLimit}
      // A `BaritoneToastManager` wraps a base-ui manager, exposing its private
      // `' subscribe'` channel unchanged; the provider reads only that (its
      // packing `add`/`update`/`promise` wrappers are for callers, not the
      // provider). A raw `ToastManager` already matches. Narrowing the union to
      // base-ui's `ToastManager` for the base-ui provider is therefore sound.
      toastManager={toastManager as ToastManager | undefined}
    >
      {children}
      <ToastViewport />
    </BaseToast.Provider>
  );
}
