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

/** Max width of the modal surface. Default `md`. */
export type ModalSize = "sm" | "md" | "lg";

/** Internal padding from the spacing scale (mirrors `Drawer`'s `padding`). */
export type ModalPadding = "none" | "sm" | "md" | "lg";

export interface ModalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * The element that opens the modal — typically a `<Modal.Trigger>`, which
   * renders a `Button`. Rendered in place, not inside the panel.
   */
  trigger?: React.ReactNode;
  /** Rendered above the body — typically a `<Modal.Header />`. */
  header?: React.ReactNode;
  /** Rendered below the body — typically a `<Modal.Footer />`. */
  footer?: React.ReactNode;
  /** Internal padding from the spacing scale. Default `md`. */
  padding?: ModalPadding;
  /** Max width of the panel: `sm`, `md` (default), or `lg`. */
  size?: ModalSize;
  /**
   * Loading state: overlays a spinner on the body (header and footer stay
   * interactive) and marks the panel `aria-busy`. Visual only; pair with
   * `disabled` to prevent closing.
   */
  loading?: boolean;
  /**
   * When `true`, the modal cannot be closed by any means (Escape and the close
   * button both vetoed). Use it while a blocking action is in flight.
   */
  disabled?: boolean;
  /** Controlled open state. */
  open?: RootProps["open"];
  /** Uncontrolled initial open state. */
  defaultOpen?: RootProps["defaultOpen"];
  /** Called when the open state changes (base-ui signature). */
  onOpenChange?: RootProps["onOpenChange"];
  /**
   * Imperative handle from `useOverlayHandle(Modal)`, to close the modal from code
   * without lifting `open` into state. Still vetoed while `disabled`.
   */
  handle?: RootProps["handle"];
  /**
   * Modal behaviour. Default `true` (focus trapped, scroll locked, page inert);
   * `'trap-focus'` leaves the page interactive; `false` is non-modal.
   */
  modal?: RootProps["modal"];
  /** Element to focus when the modal opens (base-ui default: first tabbable). */
  initialFocus?: PopupProps["initialFocus"];
  /** Element to focus when the modal closes (base-ui default: the trigger). */
  finalFocus?: PopupProps["finalFocus"];
  /** Extra className merged onto the popup surface. */
  className?: string;
  /** Ref to the popup surface element. */
  ref?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
}

/**
 * A "surface" element type shown in a panel centred over the page. Its API mirrors
 * `Drawer`: composes `header` / `footer` props (or subcomponent children) with
 * `padding` for internal spacing. Built on base-ui's `Dialog` (ARIA and focus
 * handled); opens from a `<Modal.Trigger>` via `trigger`, in three widths (`sm` /
 * `md` / `lg`). Modal, and outside-clicks never close it; `disabled` additionally
 * vetoes Escape and the close button.
 */
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

/**
 * The trigger that opens the modal. Renders a `Button` (so all of Button's
 * intents / saliencies / sizes / icons are available), wired up by base-ui so it
 * carries the right `aria-haspopup` / `aria-expanded` and toggles the modal.
 * Must be passed to `<Modal trigger={...} />` so it sits inside the modal's
 * context.
 */
export type ModalTriggerProps = ButtonProps;

function ModalTrigger(props: ModalTriggerProps) {
  return (
    <BaseDialog.Trigger
      render={(htmlAttrs) => <InternalButton consumerProps={props} htmlAttrs={htmlAttrs} />}
    />
  );
}

/**
 * A control that closes the modal, for use inside a `<Modal.Footer>` (or the
 * body). Renders a `Button`; base-ui wires the dismissal. Defaults to a neutral,
 * low-saliency button — override via the usual `Button` props. Vetoed while the
 * modal is `disabled`.
 */
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
  /**
   * Title text/content. Rendered as a `Heading` through base-ui's `Dialog.Title`,
   * so it also becomes the modal's accessible name.
   */
  title?: React.ReactNode;
  /**
   * Supporting text. Rendered as a `Text` through base-ui's `Dialog.Description`,
   * so it also becomes the modal's accessible description.
   */
  subtitle?: React.ReactNode;
  /** Document-outline level for the rendered title heading. Default `3`. */
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
  /** Spread onto `<Modal>` to bind its controlled open state. */
  modalProps: Pick<ModalProps, "open" | "onOpenChange">;
}

/**
 * Manages a `Modal`'s open state from the parent. Returns open/close/toggle
 * controls plus a `modalProps` bundle to spread onto `<Modal>`. Use it when the
 * modal must be driven from outside its trigger — opened from a menu item, or
 * closed after an async action. To only close without owning the open state,
 * prefer `useOverlayHandle(Modal)`.
 */
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

/** Modal with its compound parts attached. */
export const Modal = Object.assign(ModalRoot, {
  Trigger: ModalTrigger,
  Close: ModalClose,
  Header: ModalHeader,
  Footer: ModalFooter,
  /**
   * Creates a detached imperative handle (base-ui's `createHandle`). Prefer
   * `useOverlayHandle(Modal)` inside components; reach for this only when the
   * handle must live outside React (module scope, detached triggers).
   */
  createHandle: BaseDialog.createHandle,
});
