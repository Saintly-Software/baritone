"use client";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
import type { Intent } from "../../theme/constants";
import { cx } from "../../utils/cx";
import type { ButtonProps, SolidButtonProps } from "../Button";
import { Modal, type ModalProps } from "../Modal";
import {
  confirmationModalHeader,
  confirmationModalIcon,
  confirmationModalIconRecipe,
} from "./confirmationModal.css";

type RootProps = React.ComponentProps<typeof BaseDialog.Root>;

/**
 * The intents a `ConfirmationModal` (and its confirm button) may take. A
 * confirmation is a deliberate, often destructive, decision — so the palette is
 * limited to the intents that read as "weigh this": `secondary` (a considered
 * choice), `warning` (proceed with care), and `negative` (destructive, the
 * default). `primary`/`positive`/`neutral` are intentionally excluded — a confirm
 * dialog should never look like a happy-path call to action.
 */
export type ConfirmationIntent = Extract<Intent, "secondary" | "warning" | "negative">;

/**
 * Props for the confirm/cancel buttons. Built on the solid `Button` API, minus a
 * few knobs the dialog owns: `appearance` (always solid), and `children` is
 * optional here (each action has a sensible default label).
 */
type ActionProps = Omit<SolidButtonProps, "appearance" | "children"> & {
  /** Visible label. Defaults to `"Confirm"` / `"Cancel"`. */
  children?: React.ReactNode;
};

/** Confirm-button props — its `intent` is limited to {@link ConfirmationIntent}. */
export type ConfirmationConfirmProps = Omit<ActionProps, "intent"> & {
  intent?: ConfirmationIntent;
};

/** Cancel-button props — the full `Button` intent range (defaults to `neutral`). */
export type ConfirmationCancelProps = ActionProps;

export interface ConfirmationModalProps {
  /**
   * The title, shown beside the icon. Rendered through `Modal.Header` (base-ui's
   * `Dialog.Title`), so it also becomes the dialog's accessible name.
   */
  header?: React.ReactNode;
  /** The body — the question/consequences. Typically a short `Text` paragraph. */
  children?: React.ReactNode;
  /**
   * A leading glyph, tinted to `intent`. Pass an `<Icon>` (its colour is
   * overridden to match the intent); omit for no icon.
   */
  icon?: React.ReactNode;
  /**
   * Colour of the icon and the confirm button. Default `negative` (the common
   * destructive-confirmation case). See {@link ConfirmationIntent}.
   */
  intent?: ConfirmationIntent;
  /**
   * The confirm action is in flight: the confirm button shows a spinner, and the
   * dialog locks (Escape, cancel, and the confirm button can't dismiss it) until
   * it clears. Pair with a controlled `open` so you can close it when the work
   * resolves.
   */
  loading?: boolean;
  /**
   * Locks the dialog: both buttons go inert (`aria-disabled`, still focusable)
   * and it can't be dismissed by any means. Use for an unmet precondition.
   */
  disabled?: boolean;
  /**
   * Confirm-button props (label, `intent`, `disabledReason`, `onClick`, …). Its
   * `onClick` runs before the dialog closes; call `event.preventDefault()` in it
   * to keep the dialog open (e.g. to run async work and close it yourself later).
   */
  confirm?: ConfirmationConfirmProps;
  /** Cancel-button props. Its `onClick` runs as the dialog dismisses. */
  cancel?: ConfirmationCancelProps;
  /** Shorthand for `confirm={{ onClick }}`. Chained after `confirm.onClick`. */
  handleConfirm?: React.MouseEventHandler<HTMLButtonElement>;
  /** Shorthand for `cancel={{ onClick }}`. Chained after `cancel.onClick`. */
  handleCancel?: React.MouseEventHandler<HTMLButtonElement>;
  /**
   * The element that opens the dialog — typically a `<ConfirmationModal.Trigger>`.
   * Required in uncontrolled use; optional when driving `open` yourself.
   */
  trigger?: React.ReactNode;
  /** Controlled open state. */
  open?: RootProps["open"];
  /** Uncontrolled initial open state. */
  defaultOpen?: RootProps["defaultOpen"];
  /** Called when the open state changes (base-ui signature). */
  onOpenChange?: RootProps["onOpenChange"];
  /** Max width of the panel. Default `sm` — confirmations are compact. */
  size?: ModalProps["size"];
  /** Document-outline level for the title heading. Default `3`. */
  level?: React.ComponentProps<typeof Modal.Header>["level"];
  /** Extra className merged onto the popup surface. */
  className?: string;
  /** Ref to the popup surface element. */
  ref?: React.Ref<HTMLDivElement>;
}

/** Chain two optional event handlers, calling `a` before `b`. */
function chain<E>(
  a: ((event: E) => void) | undefined,
  b: ((event: E) => void) | undefined,
): ((event: E) => void) | undefined {
  if (!a) return b;
  if (!b) return a;
  return (event) => {
    a(event);
    b(event);
  };
}

/**
 * ConfirmationModal — a focused confirm/cancel dialog built on {@link Modal}. Use
 * it to gate a deliberate action (delete, discard, sign out) behind an explicit
 * "are you sure?".
 *
 * It's a thin preset over `Modal`: the surface, focus trap, Escape/backdrop
 * behaviour, and ARIA wiring all come from `Modal`. On top it lays out an
 * intent-tinted `icon` + `header`, the body, and a footer with a **cancel**
 * button (dismisses) and a **confirm** button (coloured by `intent`, `high`
 * saliency).
 *
 * Give it actions two ways: full {@link ConfirmationConfirmProps}/
 * {@link ConfirmationCancelProps} via `confirm`/`cancel`, or the
 * `handleConfirm`/`handleCancel` callback shorthands. Confirm dismisses the
 * dialog by default; for an async confirm, call `event.preventDefault()` in the
 * handler and close it yourself once the work resolves (`loading` shows the
 * spinner and locks the dialog meanwhile).
 *
 * @example
 * <ConfirmationModal
 *   trigger={<ConfirmationModal.Trigger intent="negative">Delete</ConfirmationModal.Trigger>}
 *   header="Delete project?"
 *   handleConfirm={() => deleteProject()}
 *   confirm={{ children: "Delete" }}
 * >
 *   <Text render={<p />}>This permanently removes the project and its data.</Text>
 * </ConfirmationModal>
 */
function ConfirmationModalRoot({
  header,
  children,
  icon,
  intent = "negative",
  loading = false,
  disabled = false,
  confirm,
  cancel,
  handleConfirm,
  handleCancel,
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  size = "sm",
  level = 3,
  className,
  ref,
}: ConfirmationModalProps) {
  // While busy (confirming or hard-disabled) the dialog is non-dismissable: Modal
  // already vetoes Escape / close / backdrop when `disabled`, so route both states
  // through it.
  const busy = loading || disabled;

  const {
    intent: confirmIntent = intent,
    onClick: confirmOnClick,
    children: confirmLabel = "Confirm",
    ...confirmRest
  } = confirm ?? {};

  const {
    intent: cancelIntent = "neutral",
    saliency: cancelSaliency = "low",
    onClick: cancelOnClick,
    children: cancelLabel = "Cancel",
    ...cancelRest
  } = cancel ?? {};

  // The confirm button closes the dialog after its handler runs — unless the
  // handler calls `preventDefault()` (async-confirm escape hatch). We render it as
  // a base-ui `Dialog.Close` purely to obtain the close callback, then gate it
  // ourselves rather than letting the Close fire unconditionally.
  const confirmButton = (
    <BaseDialog.Close
      render={(htmlAttrs) => {
        const { onClick: requestClose, ...closeAttrs } = htmlAttrs;
        const closeAfterConfirm = (event: React.MouseEvent<HTMLButtonElement>) => {
          if (!event.defaultPrevented) requestClose?.(event);
        };
        return (
          <InternalButton
            consumerProps={{
              intent: confirmIntent,
              saliency: "high",
              loading,
              disabled,
              children: confirmLabel,
              onClick: chain(chain(confirmOnClick, handleConfirm), closeAfterConfirm),
              ...confirmRest,
            }}
            htmlAttrs={closeAttrs}
          />
        );
      }}
    />
  );

  return (
    <Modal
      trigger={trigger}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      disabled={busy}
      size={size}
      className={className}
      ref={ref}
      header={
        <div className={confirmationModalHeader}>
          {icon != null && (
            <span className={cx(confirmationModalIconRecipe({ intent }), confirmationModalIcon)}>
              {icon}
            </span>
          )}
          <Modal.Header title={header} level={level} />
        </div>
      }
      footer={
        <Modal.Footer>
          <Modal.Close
            intent={cancelIntent}
            saliency={cancelSaliency}
            disabled={busy || undefined}
            onClick={chain(cancelOnClick, handleCancel)}
            {...cancelRest}
          >
            {cancelLabel}
          </Modal.Close>
          {confirmButton}
        </Modal.Footer>
      }
    >
      {children}
    </Modal>
  );
}

ConfirmationModalRoot.displayName = "ConfirmationModal";

/**
 * The trigger that opens the dialog — a `Button` (all of Button's intents /
 * saliencies / sizes / icons). Must be passed via `<ConfirmationModal trigger=…>`
 * so it sits inside the dialog's context. The same part as `Modal.Trigger`.
 */
export type ConfirmationModalTriggerProps = ButtonProps;

function ConfirmationModalTrigger(props: ConfirmationModalTriggerProps) {
  return <Modal.Trigger {...props} />;
}

/**
 * A control that dismisses the dialog from the body — e.g. an inline "keep it".
 * The same part as `Modal.Close`.
 */
export type ConfirmationModalCloseProps = ButtonProps;

function ConfirmationModalClose(props: ConfirmationModalCloseProps) {
  return <Modal.Close {...props} />;
}

ConfirmationModalTrigger.displayName = "ConfirmationModal.Trigger";
ConfirmationModalClose.displayName = "ConfirmationModal.Close";

/** ConfirmationModal with its compound parts attached. */
export const ConfirmationModal = Object.assign(ConfirmationModalRoot, {
  Trigger: ConfirmationModalTrigger,
  Close: ConfirmationModalClose,
});
