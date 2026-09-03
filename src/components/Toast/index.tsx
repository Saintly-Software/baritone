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

/**
 * Design-system fields for a toast, stashed in base-ui's per-toast `data` bag.
 * Set via {@link useToast}'s `add`/`update`, not directly.
 */
export interface ToastData {
  /** Colour intent for the underlying `Notice`. Default `neutral`. */
  intent?: Intent;
  /** `high` (washed fill, default) or `low` (subtle) — the Notice's saliency. */
  saliency?: SurfaceSaliency;
  /** A leading icon for the `Notice` — bare glyph, explicit `<Icon>`, render function, or `<Notice.Icon>`. */
  icon?: IconSlot<NoticeIconState>;
  /** Trailing action controls — typically `<Notice.Action>`s. */
  actions?: React.ReactNode[];
}

/** A live toast object (base-ui's), typed with the system's {@link ToastData}. */
export type BaritoneToast = ToastObject<ToastData>;

/** How urgently a toast is announced by assistive tech. */
export type ToastPriority = "low" | "high";

/**
 * Options for {@link useToast}'s `add`. `title` is required; everything else
 * is optional. The design-system fields (`intent`/`saliency`/`icon`/`actions`)
 * are packed into base-ui's `data` for you.
 */
export interface AddToastOptions {
  /** The toast's message — the required title line of the `Notice`. */
  title: React.ReactNode;
  /** Optional supporting text beneath the title. */
  description?: React.ReactNode;
  /** Colour intent. Default `neutral`. */
  intent?: Intent;
  /** Notice saliency — `high` (default) or `low`. */
  saliency?: SurfaceSaliency;
  /** A leading icon — bare glyph, explicit `<Icon>`, render function, or `<Notice.Icon>` to tint it. */
  icon?: IconSlot<NoticeIconState>;
  /** Trailing action controls — typically `<Notice.Action>`s. */
  actions?: React.ReactNode[];
  /**
   * Milliseconds before auto-dismiss; `0` keeps it until dismissed. Defaults to
   * the provider's `toastTimeout` (base-ui default `5000`).
   */
  timeout?: number;
  /** Announcement urgency: `high` is assertive (`alertdialog`); `low` (default) is polite (`dialog`). */
  priority?: ToastPriority;
  /** A stable id. Re-adding with an existing id updates that toast in place and resets its timer. */
  id?: string;
  /** Called when the toast has closed. */
  onClose?: () => void;
}

/** {@link AddToastOptions} for a toast created without an explicit id (promise states). */
export type ToastStateOptions = Omit<AddToastOptions, "id">;

/** Per-state options for {@link UseToastReturn.promise}; a bare string is shorthand for `{ title }`. */
export interface ToastPromiseOptions<Value> {
  /** Shown while the promise is pending. */
  loading: string | ToastStateOptions;
  /** Shown when it resolves — or a function of the resolved value. */
  success: string | ToastStateOptions | ((result: Value) => string | ToastStateOptions);
  /** Shown when it rejects — or a function of the error. */
  error: string | ToastStateOptions | ((error: unknown) => string | ToastStateOptions);
}

/** The toast controller returned by {@link useToast}. */
export interface UseToastReturn {
  /** The current list of live toasts (newest first). */
  toasts: BaritoneToast[];
  /** Show a toast; returns its id. */
  add: (options: AddToastOptions) => string;
  /** Update a live toast in place by id. */
  update: (id: string, options: Partial<AddToastOptions>) => void;
  /** Dismiss a toast by id, or the newest if omitted. */
  close: (id?: string) => void;
  /** Drive a loading → success/error toast from a promise; resolves to its value. */
  promise: <Value>(promise: Promise<Value>, options: ToastPromiseOptions<Value>) => Promise<Value>;
}

/**
 * A toast controller for firing toasts from *outside* React — module scope, a
 * store, a fetch interceptor, a query cache. Create one with
 * {@link createToastManager}, hand it to `<BaritoneProvider toastManager={…}>`,
 * then call `add`/`update`/`close`/`promise` from anywhere. Inside components,
 * prefer {@link useToast}.
 *
 * Same surface as {@link useToast} (design-system fields packed for you), minus
 * the reactive `toasts` list, with two caveats:
 *
 * - `update` replaces the toast's visual `data` wholesale — there's no reactive
 *   toast list to merge against — so pass every visual field you want kept.
 * - Toasts only reach the viewport after `BaritoneProvider` mounts. base-ui
 *   buffers nothing, so an `add`/`promise` fired during module init or SSR is
 *   dropped silently; fire in response to events instead.
 */
export interface BaritoneToastManager extends Omit<UseToastReturn, "toasts"> {
  /** base-ui's private subscription channel; `BaritoneProvider` reads it to connect this manager to the viewport. Not called directly. */
  " subscribe": ToastManager<ToastData>[" subscribe"];
}

/**
 * Splits the design-system fields (`intent`/`saliency`/`icon`/`actions`) into
 * base-ui's `data` bag; only keys the caller actually set are emitted, since
 * base-ui's `update` merges shallowly and an explicit `undefined` would *clear*
 * a field. `updateToast` merges `data` over the live toast's data itself, since
 * base-ui replaces `data` wholesale on update.
 */
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

/** A promise-state entry (`string | options`) → packed options. */
function packState(state: string | ToastStateOptions): ToastManagerAddOptions<ToastData> {
  return pack(typeof state === "string" ? { title: state } : state);
}

/**
 * Packs a `promise()` call's per-state options (`loading`/`success`/`error`)
 * into base-ui's shape. Shared by {@link useToast} and {@link createToastManager}.
 */
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

/**
 * The toast controller — call inside a `BaritoneProvider` to show, update, and
 * dismiss toasts. Wraps base-ui's `useToastManager`, accepting the
 * design-system fields (`intent`/`saliency`/`icon`/`actions`) at the top level.
 *
 * @example
 * const toast = useToast();
 * toast.add({ title: "Saved", description: "Your changes are live.", intent: "positive" });
 */
export function useToast(): UseToastReturn {
  const { toasts, add, update, close, promise } = BaseToast.useToastManager<ToastData>();

  // base-ui's manager methods are stable; only `toasts` is reactive. Memoise
  // the wrappers on those stable refs so `add` et al. keep a steady identity.
  const addToast = React.useCallback(
    (options: AddToastOptions) => add({ ...pack(options), id: options.id }),
    [add],
  );
  const updateToast = React.useCallback(
    (id: string, options: Partial<AddToastOptions>) => {
      const packed = pack(options);
      // base-ui replaces `data` wholesale, so merge over the current data to
      // keep untouched fields (e.g. icon/actions) on a partial update.
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

/**
 * Creates a {@link BaritoneToastManager} for firing toasts from *outside* React.
 * Wraps base-ui's `Toast.createToastManager`, pre-typed with {@link ToastData},
 * with `add`/`update`/`promise` accepting the design-system fields at the top
 * level — just like {@link useToast}.
 *
 * Create it once at module scope and hand it to `<BaritoneProvider>`. Toasts
 * fire only once the provider has mounted — see {@link BaritoneToastManager}
 * for that and the `update` caveat.
 *
 * @example
 * // toast.ts — module scope, no component needed
 * export const toasts = createToastManager();
 *
 * // App root
 * <BaritoneProvider toastManager={toasts}>{children}</BaritoneProvider>
 *
 * // In response to an event — an interceptor, a query cache's onError
 * toasts.add({ title: "Couldn't save", intent: "negative", priority: "high" });
 */
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

/**
 * A single rendered toast: base-ui's `Toast.Root` (a focusable `dialog` owning
 * swipe-to-dismiss, hover-to-pause, and enter/exit) wrapping a `Notice` for the UI.
 *
 * The Notice is `role="presentation"` on purpose: base-ui already announces the
 * toast via the viewport's live region and labels the Root dialog through
 * `Toast.Title`/`Toast.Description`, so the Notice's own live-region role would
 * double-announce. Title/Description render as inline spans inside the Notice's
 * own slots so `aria-labelledby`/`aria-describedby` resolve to the visible text.
 */
function ToastItem({ toast, close }: { toast: BaritoneToast; close: (id?: string) => void }) {
  const { intent, saliency, icon, actions } = toast.data ?? {};

  return (
    <BaseToast.Root
      toast={toast}
      // Bottom-right stack: throw a card right or down to dismiss it.
      swipeDirection={["right", "down"]}
      className={cx(toastRoot, focusRingRecipe({ type: "visible", offset: "sm" }))}
    >
      <Notice
        // The Root dialog carries the semantics; the Notice is just its skin.
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

/**
 * The rendered toast layer: base-ui's `Toast.Viewport` (portalled to `<body>`)
 * mapping every live toast to a {@link ToastItem}. `BaritoneProvider` renders
 * this for you — use it directly only when wiring a bare `Toast.Provider` by
 * hand, and only inside a toast provider.
 */
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
