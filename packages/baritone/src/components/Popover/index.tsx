"use client";
import { Popover as BasePopover } from "@base-ui/react/popover";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { surfaceRecipe } from "../../styles/recipes/surface.css";
import type { HeadingLevel } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { InternalButton } from "../../internal/components/InternalButton";
import type { ButtonProps } from "../Button";
import { Heading } from "../Heading";
import { Text } from "../Text";
import { popoverFooter, popoverHeader, popoverHeaderText, popoverPopup } from "./popover.css";

type RootProps = React.ComponentProps<typeof BasePopover.Root>;
type PositionerProps = React.ComponentProps<typeof BasePopover.Positioner>;
type PopupProps = React.ComponentProps<typeof BasePopover.Popup>;

export type PopoverPadding = "none" | "sm" | "md" | "lg";

export interface PopoverProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  trigger?: React.ReactNode;

  header?: React.ReactNode;

  footer?: React.ReactNode;

  padding?: PopoverPadding;

  open?: RootProps["open"];

  defaultOpen?: RootProps["defaultOpen"];

  onOpenChange?: RootProps["onOpenChange"];

  handle?: RootProps["handle"];

  modal?: RootProps["modal"];

  side?: PositionerProps["side"];

  align?: PositionerProps["align"];

  sideOffset?: PositionerProps["sideOffset"];

  initialFocus?: PopupProps["initialFocus"];

  finalFocus?: PopupProps["finalFocus"];

  className?: string;

  ref?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
}

function PopoverRoot({
  trigger,
  header,
  footer,
  padding,
  open,
  defaultOpen,
  onOpenChange,
  handle,
  modal,
  side,
  align,
  sideOffset = 8,
  initialFocus,
  finalFocus,
  className,
  children,
  ref,
  ...rest
}: PopoverProps) {
  return (
    <BasePopover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      handle={handle}
      modal={modal}
    >
      {trigger}
      <BasePopover.Portal>
        <BasePopover.Positioner side={side} align={align} sideOffset={sideOffset}>
          <BasePopover.Popup
            ref={ref}
            className={cx(
              surfaceRecipe({ padding }),
              focusRingRecipe({ type: "visible" }),
              popoverPopup,
              className,
            )}
            initialFocus={initialFocus}
            finalFocus={finalFocus}
            {...rest}
          >
            {header}
            {children}
            {footer}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

export type PopoverTriggerProps = ButtonProps;

function PopoverTrigger(props: PopoverTriggerProps) {
  return (
    <BasePopover.Trigger
      render={(htmlAttrs) => <InternalButton consumerProps={props} htmlAttrs={htmlAttrs} />}
    />
  );
}

export type PopoverCloseProps = ButtonProps;

function PopoverClose({ intent = "neutral", saliency = "low", ...rest }: PopoverCloseProps) {
  return (
    <BasePopover.Close
      render={(htmlAttrs) => (
        <InternalButton consumerProps={{ intent, saliency, ...rest }} htmlAttrs={htmlAttrs} />
      )}
    />
  );
}

export interface PopoverHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;

  subtitle?: React.ReactNode;

  level?: HeadingLevel;
  ref?: React.Ref<HTMLDivElement>;
}

function PopoverHeader({
  title,
  subtitle,
  level = 3,
  className,
  children,
  ref,
  ...rest
}: PopoverHeaderProps) {
  return (
    <div ref={ref} className={cx(popoverHeader, className)} {...rest}>
      {(title != null || subtitle != null) && (
        <div className={popoverHeaderText}>
          {title != null && (
            <BasePopover.Title render={<Heading level={level} size="lg" />}>
              {title}
            </BasePopover.Title>
          )}
          {subtitle != null && (
            <BasePopover.Description render={<Text size="sm" saliency="low" />}>
              {subtitle}
            </BasePopover.Description>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export type PopoverFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
};

function PopoverFooter({ className, children, ref, ...rest }: PopoverFooterProps) {
  return (
    <div ref={ref} className={cx(popoverFooter, className)} {...rest}>
      {children}
    </div>
  );
}

PopoverRoot.displayName = "Popover";
PopoverTrigger.displayName = "Popover.Trigger";
PopoverClose.displayName = "Popover.Close";
PopoverHeader.displayName = "Popover.Header";
PopoverFooter.displayName = "Popover.Footer";

export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Close: PopoverClose,
  Header: PopoverHeader,
  Footer: PopoverFooter,

  createHandle: BasePopover.createHandle,
});
