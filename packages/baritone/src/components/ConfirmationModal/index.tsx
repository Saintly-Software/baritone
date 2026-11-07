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

export type ConfirmationIntent = Extract<Intent, "secondary" | "warning" | "negative">;

type ActionProps = Omit<SolidButtonProps, "appearance" | "children"> & {
  children?: React.ReactNode;
};

export type ConfirmationConfirmProps = Omit<ActionProps, "intent"> & {
  intent?: ConfirmationIntent;
};

export type ConfirmationCancelProps = ActionProps;

export interface ConfirmationModalIconState {
  intent: ConfirmationIntent;
}

export interface ConfirmationModalProps {
  header?: React.ReactNode;

  children?: React.ReactNode;

  icon?: IconSlot<ConfirmationModalIconState>;

  intent?: ConfirmationIntent;

  loading?: boolean;

  disabled?: boolean;

  confirm?: ConfirmationConfirmProps;

  cancel?: ConfirmationCancelProps;

  handleConfirm?: React.MouseEventHandler<HTMLButtonElement>;

  handleCancel?: React.MouseEventHandler<HTMLButtonElement>;

  trigger?: React.ReactNode;

  open?: RootProps["open"];

  defaultOpen?: RootProps["defaultOpen"];

  onOpenChange?: RootProps["onOpenChange"];

  size?: ModalProps["size"];

  level?: React.ComponentProps<typeof Modal.Header>["level"];

  className?: string;

  ref?: React.Ref<HTMLDivElement>;
}

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

export type ConfirmationModalTriggerProps = ButtonProps;

function ConfirmationModalTrigger(props: ConfirmationModalTriggerProps) {
  return <Modal.Trigger {...props} />;
}

export type ConfirmationModalCloseProps = ButtonProps;

function ConfirmationModalClose(props: ConfirmationModalCloseProps) {
  return <Modal.Close {...props} />;
}

ConfirmationModalTrigger.displayName = "ConfirmationModal.Trigger";
ConfirmationModalClose.displayName = "ConfirmationModal.Close";

export const ConfirmationModal = Object.assign(ConfirmationModalRoot, {
  Trigger: ConfirmationModalTrigger,
  Close: ConfirmationModalClose,
});
