"use client";
import { Toast as BaseToast } from "@base-ui/react/toast";
import type {
  ToastManager,
  ToastManagerAddOptions,
  ToastManagerPromiseOptions,
  ToastObject,
} from "@base-ui/react/toast";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import type { Intent, SurfaceSaliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import type { IconSlot } from "../Icon/renderIcon";
import { Notice, type NoticeIconState } from "../Notice";
import { toastNotice, toastRoot, toastViewport } from "./toast.css";

export interface ToastData {
  intent?: Intent;

  saliency?: SurfaceSaliency;

  icon?: IconSlot<NoticeIconState>;

  actions?: React.ReactNode[];
}

export type BaritoneToast = ToastObject<ToastData>;

export type ToastPriority = "low" | "high";

export interface AddToastOptions {
  title: React.ReactNode;

  description?: React.ReactNode;

  intent?: Intent;

  saliency?: SurfaceSaliency;

  icon?: IconSlot<NoticeIconState>;

  actions?: React.ReactNode[];

  timeout?: number;

  priority?: ToastPriority;

  id?: string;

  onClose?: () => void;
}

export type ToastStateOptions = Omit<AddToastOptions, "id">;

export interface ToastPromiseOptions<Value> {
  loading: string | ToastStateOptions;

  success: string | ToastStateOptions | ((result: Value) => string | ToastStateOptions);

  error: string | ToastStateOptions | ((error: unknown) => string | ToastStateOptions);
}

export interface UseToastReturn {
  toasts: BaritoneToast[];

  add: (options: AddToastOptions) => string;

  update: (id: string, options: Partial<AddToastOptions>) => void;

  close: (id?: string) => void;

  promise: <Value>(promise: Promise<Value>, options: ToastPromiseOptions<Value>) => Promise<Value>;
}

export interface BaritoneToastManager extends Omit<UseToastReturn, "toasts"> {
  " subscribe": ToastManager<ToastData>[" subscribe"];
}

function pack(options: Partial<AddToastOptions>): ToastManagerAddOptions<ToastData> {
  const { intent, saliency, icon, actions, title, description, timeout, priority, onClose } =
    options;
  const packed: ToastManagerAddOptions<ToastData> = {};
  if (title !== undefined) packed.title = title;
  if (description !== undefined) packed.description = description;
  if (timeout !== undefined) packed.timeout = timeout;
  if (priority !== undefined) packed.priority = priority;
  if (onClose !== undefined) packed.onClose = onClose;
  const data: ToastData = {};
  if (intent !== undefined) data.intent = intent;
  if (saliency !== undefined) data.saliency = saliency;
  if (icon !== undefined) data.icon = icon;
  if (actions !== undefined) data.actions = actions;
  if (Object.keys(data).length > 0) packed.data = data;
  return packed;
}

function packState(state: string | ToastStateOptions): ToastManagerAddOptions<ToastData> {
  return pack(typeof state === "string" ? { title: state } : state);
}

function packPromiseOptions<Value>(
  options: ToastPromiseOptions<Value>,
): ToastManagerPromiseOptions<Value, ToastData> {
  return {
    loading: packState(options.loading),
    success: (result) =>
      packState(typeof options.success === "function" ? options.success(result) : options.success),
    error: (error) =>
      packState(typeof options.error === "function" ? options.error(error) : options.error),
  };
}

export function useToast(): UseToastReturn {
  const { toasts, add, update, close, promise } = BaseToast.useToastManager<ToastData>();

  const addToast = React.useCallback(
    (options: AddToastOptions) => add({ ...pack(options), id: options.id }),
    [add],
  );
  const updateToast = React.useCallback(
    (id: string, options: Partial<AddToastOptions>) => {
      const packed = pack(options);
      if (packed.data !== undefined) {
        const existing = toasts.find((toast) => toast.id === id)?.data;
        packed.data = { ...existing, ...packed.data };
      }
      update(id, packed);
    },
    [update, toasts],
  );
  const promiseToast = React.useCallback(
    <Value,>(promise_: Promise<Value>, options: ToastPromiseOptions<Value>) =>
      promise(promise_, packPromiseOptions(options)),
    [promise],
  );

  return { toasts, add: addToast, update: updateToast, close, promise: promiseToast };
}

export function createToastManager(): BaritoneToastManager {
  const manager = BaseToast.createToastManager<ToastData>();
  return {
    " subscribe": manager[" subscribe"],
    add: (options) => manager.add({ ...pack(options), id: options.id }),
    update: (id, options) => manager.update(id, pack(options)),
    close: (id) => manager.close(id),
    promise: (promise_, options) => manager.promise(promise_, packPromiseOptions(options)),
  };
}

function ToastItem({ toast, close }: { toast: BaritoneToast; close: (id?: string) => void }) {
  const { intent, saliency, icon, actions } = toast.data ?? {};

  return (
    <BaseToast.Root
      toast={toast}
      swipeDirection={["right", "down"]}
      className={cx(toastRoot, focusRingRecipe({ type: "visible", offset: "sm" }))}
    >
      <Notice
        role="presentation"
        className={toastNotice}
        intent={intent}
        saliency={saliency}
        icon={icon}
        actions={actions}
        description={
          toast.description != null ? (
            <BaseToast.Description render={<span />}>{toast.description}</BaseToast.Description>
          ) : undefined
        }
        close={() => close(toast.id)}
      >
        <BaseToast.Title render={<span />}>{toast.title}</BaseToast.Title>
      </Notice>
    </BaseToast.Root>
  );
}

export function ToastViewport() {
  const { toasts, close } = BaseToast.useToastManager<ToastData>();

  return (
    <BaseToast.Portal>
      <BaseToast.Viewport className={toastViewport}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} close={close} />
        ))}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  );
}

ToastViewport.displayName = "ToastViewport";
