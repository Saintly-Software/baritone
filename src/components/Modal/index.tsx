"use client";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { surfaceRecipe } from "../../styles/recipes/surface.css";
import type { HeadingLevel, Intent, SurfaceSaliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { Button, type ButtonProps } from "../Button";
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
  modalSpinnerIcon,
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
  /** Default `neutral` (most surfaces are neutral). */
  intent?: Intent;
  /** `low` (default neutral surface) or `high` (washed). Default `low`. */
  saliency?: SurfaceSaliency;
  /** Internal padding from the spacing scale. Default `md`. */
  padding?: ModalPadding;
  /** Max width of the panel: `sm`, `md` (default), or `lg`. */
  size?: ModalSize;
  /**
   * Loading state: overlays a spinner on the body content (the header and footer
   * stay visible and interactive, so the modal can still be closed) and marks
   * the panel `aria-busy`. Purely visual — it does not, on its own, prevent
   * closing; pair with `disabled` for that.
   */
  loading?: boolean;
  /**
   * When `true`, the modal cannot be closed by any means — Escape and the close
   * button are both vetoed (outside-press is always prevented). Use it to keep
   * the user in the panel while a blocking action is in flight.
   */
  disabled?: boolean;
  /** Controlled open state. */
  open?: RootProps["open"];
  /** Uncontrolled initial open state. */
  defaultOpen?: RootProps["defaultOpen"];
  /** Called when the open state changes (base-ui signature). */
  onOpenChange?: RootProps["onOpenChange"];
  /**
   * Modal behaviour. Default (base-ui) `true`: focus is trapped, page scroll is
   * locked, and the page behind is inert. `'trap-focus'` traps focus but leaves
   * the page scrollable/interactive; `false` is non-modal.
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
 * Modal — a "surface" element type shown in a panel centred over the page. Its
 * API mirrors `Drawer`: it composes `header` / `footer` props (or
 * `<Modal.Header>` / `<Modal.Footer>` children) around its content and takes the
 * same `intent` / `saliency` / `padding` surface knobs.
 *
 * Built on base-ui's `Dialog`, so the ARIA wiring and focus management are
 * handled for you. It opens from a `<Modal.Trigger>` (a `Button`) passed via
 * `trigger`, comes in three widths (`sm` / `md` / `lg`), and is modal: the
 * backdrop is always rendered (even for nested modals). Clicking outside never
 * closes it; pass `disabled` to additionally veto Escape and the close button
 * while a blocking action is in flight.
 */
function ModalRoot({
  trigger,
  header,
  footer,
  intent,
  saliency,
  padding,
  size = "md",
  loading = false,
  disabled = false,
  open,
  defaultOpen,
  onOpenChange,
  modal,
  initialFocus,
  finalFocus,
  className,
  children,
  ref,
  ...rest
}: ModalProps) {
  const handleOpenChange: NonNullable<RootProps["onOpenChange"]> = (nextOpen, eventDetails) => {
    // A disabled modal is non-dismissable: veto every close attempt (Escape, the
    // close button). Outside-press is already disabled via `disablePointerDismissal`
    // below. `cancel()` stops base-ui from acting on the event, so the panel stays
    // open in both controlled and uncontrolled use.
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
      modal={modal}
      // Clicking outside never closes the modal (a deliberate constraint of this
      // component); dismissal is via Escape or an explicit close control.
      disablePointerDismissal
    >
      {trigger}
      <BaseDialog.Portal>
        {/* Always rendered, even when nested inside another modal/drawer. */}
        <BaseDialog.Backdrop forceRender className={modalBackdrop} />
        <BaseDialog.Viewport className={modalViewport}>
          <BaseDialog.Popup
            ref={ref}
            className={cx(
              surfaceRecipe({ intent, saliency, padding }),
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
                  <span className={modalSpinnerIcon} />
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

function ModalTrigger({ children, ...rest }: ModalTriggerProps) {
  return <BaseDialog.Trigger render={<Button {...rest}>{children}</Button>} />;
}

/**
 * A control that closes the modal, for use inside a `<Modal.Footer>` (or the
 * body). Renders a `Button`; base-ui wires the dismissal. Defaults to a neutral,
 * low-saliency button — override via the usual `Button` props. Vetoed while the
 * modal is `disabled`.
 */
export type ModalCloseProps = ButtonProps;

function ModalClose({ children, intent = "neutral", saliency = "low", ...rest }: ModalCloseProps) {
  return (
    <BaseDialog.Close
      render={
        <Button intent={intent} saliency={saliency} {...rest}>
          {children}
        </Button>
      }
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
            <BaseDialog.Title render={<Heading level={level} variant="lg" />}>
              {title}
            </BaseDialog.Title>
          )}
          {subtitle != null && (
            <BaseDialog.Description render={<Text variant="sm" saliency="low" />}>
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
});
