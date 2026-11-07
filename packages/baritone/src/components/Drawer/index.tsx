"use client";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { surfaceRecipe } from "../../styles/recipes/surface.css";
import type { HeadingLevel, SurfaceSaliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { InternalButton } from "../../internal/components/InternalButton";
import { InternalSpinner } from "../../internal/components/InternalSpinner";
import { type ControlledOverlay, useControlledOverlay } from "../../internal/useControlledOverlay";
import type { ButtonProps } from "../Button";
import { ButtonGroup, type ButtonGroupProps } from "../ButtonGroup";
import { Heading } from "../Heading";
import { Icon } from "../Icon";
import { Menu, type MenuProps } from "../Menu";
import { Text } from "../Text";
import {
  drawerBackdrop,
  drawerBody,
  drawerBodyContentLoading,
  drawerFooter,
  drawerHeader,
  drawerHeaderActions,
  drawerHeaderText,
  drawerPopup,
  drawerSpinner,
  drawerViewport,
} from "./drawer.css";

function MoreIcon() {
  return (
    <Icon>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <circle cx="12" cy="5" r="1.75" />
        <circle cx="12" cy="12" r="1.75" />
        <circle cx="12" cy="19" r="1.75" />
      </svg>
    </Icon>
  );
}

type RootProps = React.ComponentProps<typeof BaseDrawer.Root>;
type PopupProps = React.ComponentProps<typeof BaseDrawer.Popup>;

export type DrawerSide = "left" | "right";

export type DrawerPadding = "none" | "sm" | "md" | "lg";

export type DrawerWidth = "xs" | "sm" | "md" | "lg" | "xl";

export interface DrawerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  trigger?: React.ReactNode;

  header?: React.ReactNode;

  footer?: React.ReactNode;

  saliency?: SurfaceSaliency;

  padding?: DrawerPadding;

  side?: DrawerSide;

  width?: DrawerWidth;

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

function DrawerRoot({
  trigger,
  header,
  footer,
  saliency,
  padding,
  side = "right",
  width = "md",
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
}: DrawerProps) {
  const handleOpenChange: NonNullable<RootProps["onOpenChange"]> = (nextOpen, eventDetails) => {
    if (disabled && !nextOpen) {
      eventDetails.cancel();
      return;
    }
    onOpenChange?.(nextOpen, eventDetails);
  };

  return (
    <BaseDrawer.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
      handle={handle}
      modal={modal}
      swipeDirection={side}
      disablePointerDismissal
    >
      {trigger}
      <BaseDrawer.Portal>
        <BaseDrawer.Backdrop forceRender className={drawerBackdrop} />
        <BaseDrawer.Viewport className={drawerViewport({ side })}>
          <BaseDrawer.Popup
            ref={ref}
            className={cx(
              surfaceRecipe({ saliency, padding }),
              focusRingRecipe({ type: "visible" }),
              drawerPopup({ side, width }),
              className,
            )}
            initialFocus={initialFocus}
            finalFocus={finalFocus}
            aria-busy={loading || undefined}
            {...rest}
          >
            {header}
            <BaseDrawer.Content className={drawerBody}>
              <div className={cx(loading && drawerBodyContentLoading)}>{children}</div>
              {loading && (
                <span className={drawerSpinner} aria-hidden>
                  <InternalSpinner size="lg" />
                </span>
              )}
            </BaseDrawer.Content>
            {footer}
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
}

export type DrawerTriggerProps = ButtonProps;

function DrawerTrigger(props: DrawerTriggerProps) {
  return (
    <BaseDrawer.Trigger
      render={(htmlAttrs) => <InternalButton consumerProps={props} htmlAttrs={htmlAttrs} />}
    />
  );
}

export type DrawerCloseProps = ButtonProps;

function DrawerClose({ intent = "neutral", saliency = "low", ...rest }: DrawerCloseProps) {
  return (
    <BaseDrawer.Close
      render={(htmlAttrs) => (
        <InternalButton consumerProps={{ intent, saliency, ...rest }} htmlAttrs={htmlAttrs} />
      )}
    />
  );
}

export interface DrawerHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;

  subtitle?: React.ReactNode;

  level?: HeadingLevel;

  actions?: MenuProps["items"];

  actionsLabel?: string;
  ref?: React.Ref<HTMLDivElement>;
}

function DrawerHeader({
  title,
  subtitle,
  level = 3,
  actions,
  actionsLabel = "Actions",
  className,
  children,
  ref,
  ...rest
}: DrawerHeaderProps) {
  const hasActions = actions != null && actions.some(Boolean);
  return (
    <div ref={ref} className={cx(drawerHeader, className)} {...rest}>
      {(title != null || subtitle != null) && (
        <div className={drawerHeaderText}>
          {title != null && (
            <BaseDrawer.Title render={<Heading level={level} size="lg" />}>
              {title}
            </BaseDrawer.Title>
          )}
          {subtitle != null && (
            <BaseDrawer.Description render={<Text size="sm" saliency="low" />}>
              {subtitle}
            </BaseDrawer.Description>
          )}
        </div>
      )}
      {(children != null || hasActions) && (
        <div className={drawerHeaderActions}>
          {children}
          {hasActions && (
            <Menu
              trigger={
                <Menu.Trigger
                  icon={<MoreIcon />}
                  aria-label={actionsLabel}
                  intent="neutral"
                  saliency="low"
                  size="sm"
                />
              }
              items={actions}
            />
          )}
        </div>
      )}
    </div>
  );
}

export type DrawerFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  actions?: ButtonGroupProps["items"];
  ref?: React.Ref<HTMLDivElement>;
};

function DrawerFooter({ actions, className, children, ref, ...rest }: DrawerFooterProps) {
  return (
    <div ref={ref} className={cx(drawerFooter, className)} {...rest}>
      {children}
      {actions != null && actions.length > 0 && <ButtonGroup items={actions} />}
    </div>
  );
}

export interface UseControlledDrawerReturn extends ControlledOverlay {
  drawerProps: Pick<DrawerProps, "open" | "onOpenChange">;
}

export function useControlledDrawer(defaultOpen = false): UseControlledDrawerReturn {
  const overlay = useControlledOverlay(defaultOpen);
  return {
    ...overlay,
    drawerProps: { open: overlay.isOpen, onOpenChange: overlay.setOpen },
  };
}

DrawerRoot.displayName = "Drawer";
DrawerTrigger.displayName = "Drawer.Trigger";
DrawerClose.displayName = "Drawer.Close";
DrawerHeader.displayName = "Drawer.Header";
DrawerFooter.displayName = "Drawer.Footer";

export const Drawer = Object.assign(DrawerRoot, {
  Trigger: DrawerTrigger,
  Close: DrawerClose,
  Header: DrawerHeader,
  Footer: DrawerFooter,

  createHandle: BaseDrawer.createHandle,
});
