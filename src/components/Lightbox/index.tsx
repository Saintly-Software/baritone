"use client";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
import { cx } from "../../utils/cx";
import type { ButtonProps } from "../Button";
import { Icon } from "../Icon";
import {
  lightboxBackdrop,
  lightboxClose,
  lightboxImage,
  lightboxPopup,
  lightboxViewport,
} from "./lightbox.css";

type RootProps = React.ComponentProps<typeof BaseDialog.Root>;
type PopupProps = React.ComponentProps<typeof BaseDialog.Popup>;

/**
 * The "close" glyph (an X). Inlined here since the library ships no icon set
 * (mirrors `Drawer`'s `MoreIcon`).
 */
function CloseIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
      </svg>
    </Icon>
  );
}

export interface LightboxProps {
  /** Image source shown at full size. */
  src: string;
  /**
   * Alt text for the image. Also becomes the dialog's accessible name; falls
   * back to `"Image"` when omitted (so the dialog is never nameless).
   */
  alt?: string;
  /**
   * The element that opens the lightbox — typically a `<Lightbox.Trigger>`,
   * which renders a `Button`. Rendered in place, not inside the overlay.
   */
  trigger?: React.ReactNode;
  /** Accessible name for the built-in close button. Default `"Close"`. */
  closeLabel?: string;
  /** Controlled open state. */
  open?: RootProps["open"];
  /** Uncontrolled initial open state. */
  defaultOpen?: RootProps["defaultOpen"];
  /** Called when the open state changes (base-ui signature). */
  onOpenChange?: RootProps["onOpenChange"];
  /**
   * Imperative handle from `useOverlayHandle(Lightbox)`. Lets you open/close the
   * lightbox from code without lifting `open` into component state.
   */
  handle?: RootProps["handle"];
  /** Element to focus when the lightbox opens (base-ui default: first tabbable). */
  initialFocus?: PopupProps["initialFocus"];
  /** Element to focus when the lightbox closes (base-ui default: the trigger). */
  finalFocus?: PopupProps["finalFocus"];
  /** Extra className merged onto the `<img>`. */
  className?: string;
  /** Ref to the `<img>` element. */
  ref?: React.Ref<HTMLImageElement>;
  /**
   * Optional content rendered below the image inside the overlay — e.g. a
   * caption or custom controls. Sits on the dimmed backdrop, so style it for a
   * dark surround.
   */
  children?: React.ReactNode;
}

/**
 * Lightbox — opens an image at full size in a dialog centred over a dimmed
 * page. It opens from a `<Lightbox.Trigger>` (a `Button`) passed via `trigger`,
 * and is dismissed by clicking the backdrop, pressing Escape, or the built-in
 * close button in the image's corner. Clicking the image itself does not close
 * it.
 *
 * Built on base-ui's `Dialog`, so the ARIA wiring and focus management are
 * handled for you: the overlay is modal (the backdrop is always rendered) and
 * takes its accessible name from `alt`.
 */
function LightboxRoot({
  src,
  alt,
  trigger,
  closeLabel = "Close",
  open,
  defaultOpen,
  onOpenChange,
  handle,
  initialFocus,
  finalFocus,
  className,
  ref,
  children,
}: LightboxProps) {
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      handle={handle}
    >
      {trigger}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={lightboxBackdrop} />
        <BaseDialog.Viewport className={lightboxViewport}>
          <BaseDialog.Popup
            className={lightboxPopup}
            aria-label={alt || "Image"}
            initialFocus={initialFocus}
            finalFocus={finalFocus}
          >
            <BaseDialog.Close
              render={(htmlAttrs) => (
                <InternalButton
                  consumerProps={{
                    size: "sm",
                    saliency: "low",
                    icon: <CloseIcon />,
                    "aria-label": closeLabel,
                    className: lightboxClose,
                  }}
                  htmlAttrs={htmlAttrs}
                />
              )}
            />
            {/* Empty string (not an absent attribute) when `alt` is omitted, so the
                image is exposed as decorative rather than named from its src — the
                dialog itself already carries the `alt || "Image"` name. */}
            <img ref={ref} className={cx(lightboxImage, className)} src={src} alt={alt ?? ""} />
            {children}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

/**
 * The trigger that opens the lightbox. Renders a `Button` (so all of Button's
 * intents / saliencies / sizes / icons are available), wired up by base-ui so it
 * carries the right `aria-haspopup` / `aria-expanded` and toggles the lightbox.
 * Must be passed to `<Lightbox trigger={...} />` so it sits inside the
 * lightbox's context.
 */
export type LightboxTriggerProps = ButtonProps;

function LightboxTrigger(props: LightboxTriggerProps) {
  return (
    <BaseDialog.Trigger
      render={(htmlAttrs) => <InternalButton consumerProps={props} htmlAttrs={htmlAttrs} />}
    />
  );
}

LightboxRoot.displayName = "Lightbox";
LightboxTrigger.displayName = "Lightbox.Trigger";

/** Lightbox with its compound parts attached. */
export const Lightbox = Object.assign(LightboxRoot, {
  Trigger: LightboxTrigger,
  /**
   * Creates a detached imperative handle (base-ui's `createHandle`). Prefer
   * `useOverlayHandle(Lightbox)` inside components; reach for this only when the
   * handle must live outside React (module scope, detached triggers).
   */
  createHandle: BaseDialog.createHandle,
});
