"use client";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { surfaceRecipe } from "../../styles/recipes/surface.css";
import type { HeadingLevel } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { InternalButton } from "../../internal/components/InternalButton";
import { InternalSpinner } from "../../internal/components/InternalSpinner";
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
   * Loading state: overlays a spinner on the body content and marks the panel
   * `aria-busy`; the header/footer stay visible and interactive. Purely visual —
   * pair with `disabled` to actually prevent closing.
   */
  loading?: boolean;
  /**
   * When `true`, the modal cannot be closed by any means — Escape and the close
   * button are both vetoed. Use it to keep the user in the panel during a
   * blocking action.
   */
  disabled?: boolean;
  /** Controlled open state. */
  open?: RootProps["open"];
  /** Uncontrolled initial open state. */
  defaultOpen?: RootProps["defaultOpen"];
  /** Called when the open state changes (base-ui signature). */
  onOpenChange?: RootProps["onOpenChange"];
  /**
   * Imperative handle from `useOverlayHandle(Modal)`. Lets you close the modal
   * from code (e.g. after an async action) without lifting `open` into state.
   * Still vetoed while `disabled`, alongside `.Close` and controlled `open`.
   */
  handle?: RootProps["handle"];
  /**
   * Modal behaviour. Default `true`: focus trapped, scroll locked, page behind
   * inert. `'trap-focus'` traps focus but leaves the page scrollable/interactive;
   * `false` is non-modal.
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
 * Modal — a "surface" element shown in a panel centred over the page. Its API
 * mirrors `Drawer`: it composes `header`/`footer` props (or `<Modal.Header>`/
 * `<Modal.Footer>` children) around its content, with `padding` controlling
 * internal spacing.
 *
 * Built on base-ui's `Dialog` (ARIA wiring and focus management included). It
 * opens from a `<Modal.Trigger>` passed via `trigger`, comes in three widths
 * (`sm`/`md`/`lg`), and always renders its backdrop (even nested). Clicking
 * outside never closes it; pass `disabled` to also veto Escape and the close
 * button during a blocking action.
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
    // Disabled: veto every close attempt (see `disabled` doc above). `cancel()`
    // stops base-ui acting on the event, keeping the panel open either way.
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
      // Never closes on outside-press — see class doc above.
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
 * The trigger that opens the modal. Renders a `Button` wired by base-ui with the
 * right `aria-haspopup`/`aria-expanded`. Must be passed to `<Modal trigger={...} />`
 * so it sits inside the modal's context.
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
 * body). Renders a `Button` defaulting to neutral/low-saliency — override via
 * the usual `Button` props. Vetoed while the modal is `disabled`.
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
