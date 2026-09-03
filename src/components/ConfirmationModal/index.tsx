"use client";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
import type { Intent } from "../../theme/constants";
import { cx } from "../../utils/cx";
import type { ButtonProps, SolidButtonProps } from "../Button";
import { type IconSlot, renderIcon } from "../Icon/renderIcon";
import { Modal, type ModalProps } from "../Modal";
import {
  confirmationModalHeader,
  confirmationModalIcon,
  confirmationModalIconRecipe,
} from "./confirmationModal.css";

type RootProps = React.ComponentProps<typeof BaseDialog.Root>;

/**
 * The intents a `ConfirmationModal` (and its confirm button) may take:
 * `secondary` (a considered choice), `warning` (proceed with care), or
 * `negative` (destructive, the default). `primary`/`positive`/`neutral` are
 * excluded — a confirm dialog should never look like a happy-path CTA.
 */
export type ConfirmationIntent = Extract<Intent, "secondary" | "warning" | "negative">;

/**
 * Props for the confirm/cancel buttons: the solid `Button` API minus
 * `appearance` (always solid). `children` is optional — each action has a
 * default label.
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

/**
 * The resolved state a `ConfirmationModal` icon render function branches on —
 * just the intent the dialog tints its icon by.
 */
export interface ConfirmationModalIconState {
  /** The dialog's resolved intent — the colour the icon is tinted to. */
  intent: ConfirmationIntent;
}

export interface ConfirmationModalProps {
  /** The title, shown beside the icon. Rendered via `Modal.Header`, so it also becomes the dialog's accessible name. */
  header?: React.ReactNode;
  /** The body — the question/consequences. Typically a short `Text` paragraph. */
  children?: React.ReactNode;
  /**
   * A leading glyph, tinted to `intent`. Pass a bare glyph (auto-wrapped in
   * `Icon`), an explicit `<Icon>` for a custom size/label, or a render function
   * for full control. Omit for no icon.
   */
  icon?: IconSlot<ConfirmationModalIconState>;
  /** Colour of the icon and confirm button. Default `negative`. See {@link ConfirmationIntent}. */
  intent?: ConfirmationIntent;
  /**
   * The confirm action is in flight: the confirm button spins and the dialog
   * locks (Escape/cancel/confirm can't dismiss it) until it clears. Pair with
   * a controlled `open` to close it once the work resolves.
   */
  loading?: boolean;
  /**
   * Locks the dialog: both buttons go inert (`aria-disabled`, still focusable)
   * and it can't be dismissed. Use for an unmet precondition.
   */
  disabled?: boolean;
  /**
   * Confirm-button props (label, `intent`, `onClick`, …). `onClick` runs before
   * the dialog closes; call `event.preventDefault()` to keep it open for async work.
   */
  confirm?: ConfirmationConfirmProps;
  /** Cancel-button props. Its `onClick` runs as the dialog dismisses. */
  cancel?: ConfirmationCancelProps;
  /** Shorthand for `confirm={{ onClick }}`. Chained after `confirm.onClick`. */
  handleConfirm?: React.MouseEventHandler<HTMLButtonElement>;
  /** Shorthand for `cancel={{ onClick }}`. Chained after `cancel.onClick`. */
  handleCancel?: React.MouseEventHandler<HTMLButtonElement>;
  /** The element that opens the dialog — typically a `<ConfirmationModal.Trigger>`. Required unless you drive `open` yourself. */
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
 * ConfirmationModal — a focused confirm/cancel dialog built on {@link Modal}.
 * Gates a deliberate action (delete, discard, sign out) behind an explicit
 * "are you sure?".
 *
 * A thin preset over `Modal`: the surface, focus trap, Escape/backdrop, and
 * ARIA wiring come from there. On top it lays out an intent-tinted `icon` +
 * `header`, the body, and a footer with a **cancel** button (dismisses) and a
 * **confirm** button (coloured by `intent`, `high` saliency).
 *
 * Pass actions via `confirm`/`cancel` ({@link ConfirmationConfirmProps}/
 * {@link ConfirmationCancelProps}) or the `handleConfirm`/`handleCancel`
 * shorthands. Confirm dismisses by default; call `event.preventDefault()` for
 * an async confirm and close it yourself once the work resolves (`loading`
 * shows the spinner and locks the dialog meanwhile).
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
  // While busy the dialog is non-dismissable: Modal already vetoes Escape/close/
  // backdrop when `disabled`, so route both states through it.
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

  // Closes the dialog after its handler runs, unless `preventDefault()` was
  // called. Rendered as `Dialog.Close` only to obtain the close callback, which
  // we gate ourselves rather than letting it fire unconditionally.
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
              {renderIcon(icon, { state: { intent } })}
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
 * The trigger that opens the dialog — a `Button` with all of Button's intents,
 * saliencies, sizes, and icons. Must be passed via `<ConfirmationModal trigger=…>`
 * so it sits inside the dialog's context. Same part as `Modal.Trigger`.
 */
export type ConfirmationModalTriggerProps = ButtonProps;

function ConfirmationModalTrigger(props: ConfirmationModalTriggerProps) {
  return <Modal.Trigger {...props} />;
}

/** A control that dismisses the dialog from the body — e.g. an inline "keep it". Same part as `Modal.Close`. */
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
