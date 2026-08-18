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
import { Notice } from "../Notice";
import { toastNotice, toastRoot, toastViewport } from "./toast.css";

/**
 * The design-system fields carried on a toast, stashed in base-ui's per-toast
 * `data` bag so `ToastItem` can read them back when it renders the `Notice`.
 * Consumers never touch this directly — {@link useToast}'s `add`/`update` accept
 * these at the top level and pack them in here.
 */
export interface ToastData {
  /** Colour intent for the underlying `Notice`. Default `neutral`. */
  intent?: Intent;
  /** `high` (washed fill, default) or `low` (subtle) — the Notice's saliency. */
  saliency?: SurfaceSaliency;
  /** A leading glyph (wrapped in an `<Icon>` by the Notice), or a `<Notice.Icon>`. */
  icon?: React.ReactNode;
  /** Trailing action controls — typically `<Notice.Action>`s. */
  actions?: React.ReactNode[];
}

/** A live toast object (base-ui's), typed with the system's {@link ToastData}. */
export type BaritoneToast = ToastObject<ToastData>;

/** How urgently a toast is announced by assistive tech. */
export type ToastPriority = "low" | "high";

/**
 * Options for {@link useToast}'s `add`. `title` is the toast's message (the
 * required line); everything else is optional supporting detail. The
 * design-system fields (`intent`/`saliency`/`icon`/`actions`) sit alongside
 * base-ui's timing/identity fields and are packed into `data` for you.
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
  /** A leading glyph, or a `<Notice.Icon>` to tint it a different intent. */
  icon?: React.ReactNode;
  /** Trailing action controls — typically `<Notice.Action>`s. */
  actions?: React.ReactNode[];
  /**
   * Milliseconds before the toast auto-dismisses. `0` keeps it until dismissed.
   * Defaults to the provider's `toastTimeout` (base-ui default `5000`).
   */
  timeout?: number;
  /**
   * Announcement urgency. `high` uses an assertive live region (`alertdialog`);
   * `low` (default) is polite (`dialog`).
   */
  priority?: ToastPriority;
  /**
   * A stable id. Re-adding with an existing id updates that toast in place and
   * resets its timer (a useful de-dupe / progress key).
   */
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
 * store, a fetch interceptor, a TanStack Query cache: anywhere there's no
 * component to call {@link useToast} from. Create one with
 * {@link createToastManager}, hand it to `<BaritoneProvider toastManager={…}>` to
 * wire it to the on-screen viewport, then call `add`/`update`/`close`/`promise`
 * from anywhere. Inside components, prefer {@link useToast}.
 *
 * Its `add`/`update`/`close`/`promise` are the same surface as {@link useToast}'s
 * (they take the design-system `intent`/`saliency`/`icon`/`actions` fields packed
 * for you), minus the reactive `toasts` list, plus base-ui's subscription
 * channel — with two caveats:
 *
 * - `update` replaces the toast's visual `data` wholesale rather than merging over
 *   the live toast (a module-scope manager holds no reactive toast list to merge
 *   against), so pass every visual field you want kept.
 * - Toasts only reach the viewport once `BaritoneProvider` has mounted and
 *   subscribed. base-ui's manager buffers nothing, so an `add`/`promise` that runs
 *   during module init or an SSR pass — before the provider commits — is dropped
 *   silently. Fire in response to events (a request failing, a click), by which
 *   point the provider is mounted.
 */
export interface BaritoneToastManager extends Omit<UseToastReturn, "toasts"> {
  /**
   * base-ui's private subscription channel, read by `BaritoneProvider` to
   * connect this manager to the viewport. Not called directly.
   */
  " subscribe": ToastManager<ToastData>[" subscribe"];
}

/**
 * Split the design-system fields (`intent`/`saliency`/`icon`/`actions`) into
 * base-ui's `data` bag, leaving the timing/identity fields flat. Only keys the
 * caller actually set are emitted — base-ui's `update` merges shallowly, so an
 * explicit `undefined` would *clear* a field (`update(id, { title })` must not
 * wipe the intent). The `data` bag likewise carries only the set fields;
 * `updateToast` merges it over the live toast's existing `data` (base-ui replaces
 * `data` wholesale) so a partial update keeps the untouched visual fields.
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
 * Pack a `promise()` call's per-state options (`loading`/`success`/`error`, each a
 * `string`, options object, or function of the settled value) into base-ui's
 * shape. Shared by {@link useToast} and {@link createToastManager}.
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
 * The toast controller — call it inside a `BaritoneProvider` (or any
 * `Toast.Provider`) to show, update, and dismiss toasts. It wraps base-ui's
 * `useToastManager`, letting you pass the design-system fields
 * (`intent`/`saliency`/`icon`/`actions`) at the top level.
 *
 * @example
 * const toast = useToast();
 * toast.add({ title: "Saved", description: "Your changes are live.", intent: "positive" });
 */
export function useToast(): UseToastReturn {
  const { toasts, add, update, close, promise } = BaseToast.useToastManager<ToastData>();

  // base-ui's manager methods are stable (they come off the store); only `toasts`
  // is reactive. Memoise the wrappers on those stable refs so `add` et al. keep a
  // steady identity across renders.
  const addToast = React.useCallback(
    (options: AddToastOptions) => add({ ...pack(options), id: options.id }),
    [add],
  );
  const updateToast = React.useCallback(
    (id: string, options: Partial<AddToastOptions>) => {
      const packed = pack(options);
      // base-ui replaces `data` wholesale on update; merge over the live toast's
      // current data so a partial update (e.g. just `intent`) keeps icon/actions.
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
 * Create a {@link BaritoneToastManager} for firing toasts from *outside* React.
 * Wraps base-ui's `Toast.createToastManager`, pre-typed with {@link ToastData} and
 * with `add`/`update`/`promise` accepting the design-system fields
 * (`intent`/`saliency`/`icon`/`actions`) at the top level — just like
 * {@link useToast}, so module-scope code needn't know about base-ui's `data` bag.
 *
 * Create it once at module scope and hand it to `<BaritoneProvider>` so it reaches
 * the on-screen viewport:
 *
 * Toasts fire once `BaritoneProvider` has mounted — see {@link BaritoneToastManager}
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
 * A single rendered toast: base-ui's `Toast.Root` (a focusable `dialog` that
 * owns the swipe-to-dismiss, hover-to-pause, and enter/exit lifecycle) wrapping a
 * `Notice` for the actual UI.
 *
 * The Notice is marked `role="presentation"` on purpose: base-ui already
 * announces the toast through the viewport's live region and labels the Root
 * dialog via `Toast.Title`/`Toast.Description`, so the Notice's own
 * `status`/`alert` live-region role would double-announce. The Title/Description
 * render as inline spans *inside* the Notice's own title/description slots, so the
 * dialog's `aria-labelledby`/`aria-describedby` resolve to the visible text.
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
 * this for you; drop it in yourself only if you're wiring a bare
 * `Toast.Provider` by hand. Must live inside a toast provider.
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
