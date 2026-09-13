"use client";
import { Toast as BaseToast } from "@base-ui/react/toast";
import type { ToastManager } from "@base-ui/react/toast";
import * as React from "react";
import { ToastViewport } from "../Toast";
import type { BaritoneToastManager } from "../Toast";

export interface BaritoneProviderProps {
  children: React.ReactNode;

  toastTimeout?: number;

  toastLimit?: number;

  toastManager?: BaritoneToastManager | ToastManager;
}

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
      toastManager={toastManager as ToastManager | undefined}
    >
      {children}
      <ToastViewport />
    </BaseToast.Provider>
  );
}
