"use client";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { surfaceRecipe } from "../../styles/recipes/surface.css";
import type { HeadingLevel } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { InternalButton } from "../../internal/components/InternalButton";
import { InternalSpinner } from "../../internal/components/InternalSpinner";
import { type ControlledOverlay, useControlledOverlay } from "../../internal/useControlledOverlay";
import type { ButtonProps } from "../Button";
import { Heading } from "../Heading";
import { Text } from "../Text";
import {
  modalBackdrop,
  modalBody,
  modalBodyContentLoading,
  modalFooter,
  modalHeader,
  modalHeaderText,
  modalPopup,
  modalSpinner,
  modalViewport,
} from "./modal.css";

type RootProps = React.ComponentProps<typeof BaseDialog.Root>;
type PopupProps = React.ComponentProps<typeof BaseDialog.Popup>;

export type ModalSize = "sm" | "md" | "lg";

export type ModalPadding = "none" | "sm" | "md" | "lg";

export interface ModalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  trigger?: React.ReactNode;

  header?: React.ReactNode;

  footer?: React.ReactNode;

  padding?: ModalPadding;

  size?: ModalSize;

  loading?: boolean;

  disabled?: boolean;

  open?: RootProps["open"];

  defaultOpen?: RootProps["defaultOpen"];

  onOpenChange?: RootProps["onOpenChange"];

  handle?: RootProps["handle"];

  modal?: RootProps["modal"];

  initialFocus?: PopupProps["initialFocus"];

  finalFocus?: PopupProps["finalFocus"];

  className?: string;

  ref?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
}

function ModalRoot({
  trigger,
  header,
  footer,
  padding,
  size = "md",
  loading = false,
  disabled = false,
  open,
  defaultOpen,
  onOpenChange,
  handle,
  modal,
  initialFocus,
  finalFocus,
  className,
  children,
  ref,
  ...rest
}: ModalProps) {
  const handleOpenChange: NonNullable<RootProps["onOpenChange"]> = (nextOpen, eventDetails) => {
    if (disabled && !nextOpen) {
      eventDetails.cancel();
      return;
    }
    onOpenChange?.(nextOpen, eventDetails);
  };

  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
      handle={handle}
      modal={modal}
      disablePointerDismissal
    >
      {trigger}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop forceRender className={modalBackdrop} />
        <BaseDialog.Viewport className={modalViewport}>
          <BaseDialog.Popup
            ref={ref}
            className={cx(
              surfaceRecipe({ padding }),
              focusRingRecipe({ type: "visible" }),
              modalPopup({ size }),
              className,
            )}
            initialFocus={initialFocus}
            finalFocus={finalFocus}
            aria-busy={loading || undefined}
            {...rest}
          >
            {header}
            <div className={modalBody}>
              <div className={cx(loading && modalBodyContentLoading)}>{children}</div>
              {loading && (
                <span className={modalSpinner} aria-hidden>
                  <InternalSpinner size="lg" />
                </span>
              )}
            </div>
            {footer}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export type ModalTriggerProps = ButtonProps;

function ModalTrigger(props: ModalTriggerProps) {
  return (
    <BaseDialog.Trigger
      render={(htmlAttrs) => <InternalButton consumerProps={props} htmlAttrs={htmlAttrs} />}
    />
  );
}

export type ModalCloseProps = ButtonProps;

function ModalClose({ intent = "neutral", saliency = "low", ...rest }: ModalCloseProps) {
  return (
    <BaseDialog.Close
      render={(htmlAttrs) => (
        <InternalButton consumerProps={{ intent, saliency, ...rest }} htmlAttrs={htmlAttrs} />
      )}
    />
  );
}

export interface ModalHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;

  subtitle?: React.ReactNode;

  level?: HeadingLevel;
  ref?: React.Ref<HTMLDivElement>;
}

function ModalHeader({
  title,
  subtitle,
  level = 3,
  className,
  children,
  ref,
  ...rest
}: ModalHeaderProps) {
  return (
    <div ref={ref} className={cx(modalHeader, className)} {...rest}>
      {(title != null || subtitle != null) && (
        <div className={modalHeaderText}>
          {title != null && (
            <BaseDialog.Title render={<Heading level={level} size="lg" />}>
              {title}
            </BaseDialog.Title>
          )}
          {subtitle != null && (
            <BaseDialog.Description render={<Text size="sm" saliency="low" />}>
              {subtitle}
            </BaseDialog.Description>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export type ModalFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
};

function ModalFooter({ className, children, ref, ...rest }: ModalFooterProps) {
  return (
    <div ref={ref} className={cx(modalFooter, className)} {...rest}>
      {children}
    </div>
  );
}

export interface UseControlledModalReturn extends ControlledOverlay {
  modalProps: Pick<ModalProps, "open" | "onOpenChange">;
}

export function useControlledModal(defaultOpen = false): UseControlledModalReturn {
  const overlay = useControlledOverlay(defaultOpen);
  return {
    ...overlay,
    modalProps: { open: overlay.isOpen, onOpenChange: overlay.setOpen },
  };
}

ModalRoot.displayName = "Modal";
ModalTrigger.displayName = "Modal.Trigger";
ModalClose.displayName = "Modal.Close";
ModalHeader.displayName = "Modal.Header";
ModalFooter.displayName = "Modal.Footer";

export const Modal = Object.assign(ModalRoot, {
  Trigger: ModalTrigger,
  Close: ModalClose,
  Header: ModalHeader,
  Footer: ModalFooter,

  createHandle: BaseDialog.createHandle,
});
