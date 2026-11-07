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
  src: string;

  alt?: string;

  trigger?: React.ReactNode;

  closeLabel?: string;

  open?: RootProps["open"];

  defaultOpen?: RootProps["defaultOpen"];

  onOpenChange?: RootProps["onOpenChange"];

  handle?: RootProps["handle"];

  initialFocus?: PopupProps["initialFocus"];

  finalFocus?: PopupProps["finalFocus"];

  className?: string;

  ref?: React.Ref<HTMLImageElement>;

  children?: React.ReactNode;
}

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
            <img ref={ref} className={cx(lightboxImage, className)} src={src} alt={alt ?? ""} />
            {children}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

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

export const Lightbox = Object.assign(LightboxRoot, {
  Trigger: LightboxTrigger,

  createHandle: BaseDialog.createHandle,
});
