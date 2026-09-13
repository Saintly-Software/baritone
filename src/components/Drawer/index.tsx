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

/**
 * The "more options" glyph (a vertical ellipsis) used as the header actions
 * `Menu` trigger. Inlined here since the library ships no icon set.
 */
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

/** Which edge the drawer slides in from. Default `right`. */
export type DrawerSide = "left" | "right";

/** Internal padding from the spacing scale (mirrors `Popover`'s `padding`). */
export type DrawerPadding = "none" | "sm" | "md" | "lg";

/** Width of the panel. Default `md`. */
export type DrawerWidth = "xs" | "sm" | "md" | "lg" | "xl";

export interface DrawerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * The element that opens the drawer — typically a `<Drawer.Trigger>`, which
   * renders a `Button`. Rendered in place, not inside the panel.
   */
  trigger?: React.ReactNode;
  /** Rendered above the body — typically a `<Drawer.Header />`. */
  header?: React.ReactNode;
  /** Rendered below the body — typically a `<Drawer.Footer />`. */
  footer?: React.ReactNode;
  /** `low` (default neutral surface) or `high` (washed). Default `low`. */
  saliency?: SurfaceSaliency;
  /** Internal padding from the spacing scale. Default `md`. */
  padding?: DrawerPadding;
  /** Edge the drawer slides in from. Default `right`. */
  side?: DrawerSide;
  /**
   * Width of the panel: `xs` / `sm` / `md` (default) / `lg` / `xl`, each capped
   * to the viewport so a wide drawer shrinks to fit on small screens.
   */
  width?: DrawerWidth;
  /**
   * Loading state: overlays a spinner on the body (header and footer stay
   * interactive) and marks the panel `aria-busy`. Visual only; pair with
   * `disabled` to prevent closing.
   */
  loading?: boolean;
  /**
   * When `true`, the drawer cannot be closed by any means (Escape, close button,
   * swipe all vetoed). Use it while a blocking action is in flight.
   */
  disabled?: boolean;
  /** Controlled open state. */
  open?: RootProps["open"];
  /** Uncontrolled initial open state. */
  defaultOpen?: RootProps["defaultOpen"];
  /** Called when the open state changes (base-ui signature). */
  onOpenChange?: RootProps["onOpenChange"];
  /**
   * Imperative handle from `useOverlayHandle(Drawer)`, to close the drawer from
   * code without lifting `open` into state. Still vetoed while `disabled`.
   */
  handle?: RootProps["handle"];
  /**
   * Modal behaviour. Default `true` (focus trapped, scroll locked, page inert);
   * `'trap-focus'` leaves the page interactive; `false` is non-modal.
   */
  modal?: RootProps["modal"];
  /** Element to focus when the drawer opens (base-ui default: first tabbable). */
  initialFocus?: PopupProps["initialFocus"];
  /** Element to focus when the drawer closes (base-ui default: the trigger). */
  finalFocus?: PopupProps["finalFocus"];
  /** Extra className merged onto the popup surface. */
  className?: string;
  /** Ref to the popup surface element. */
  ref?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
}

/**
 * A "surface" element type shown in a panel that slides in from the screen edge.
 * Like `Popover` / `Modal`, composes `header` / `footer` props (or subcomponent
 * children) around its content, with `saliency` / `padding` / `width` knobs. Built
 * on base-ui's `Drawer` (ARIA, focus, swipe-to-dismiss handled); opens from a
 * `<Drawer.Trigger>` via `trigger`, slides in from `right` by default. Modal, and
 * outside-clicks never close it; `disabled` additionally vetoes Escape/close/swipe.
 */
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

/**
 * The trigger that opens the drawer — a `Button`, wired by base-ui with
 * `aria-haspopup` / `aria-expanded`. Must be passed to `<Drawer trigger={...} />`.
 */
export type DrawerTriggerProps = ButtonProps;

function DrawerTrigger(props: DrawerTriggerProps) {
  return (
    <BaseDrawer.Trigger
      render={(htmlAttrs) => <InternalButton consumerProps={props} htmlAttrs={htmlAttrs} />}
    />
  );
}

/**
 * A control that closes the drawer, for use inside a `<Drawer.Footer>` (or the
 * body). Renders a `Button`; base-ui wires the dismissal. Defaults to a neutral,
 * low-saliency button — override via the usual `Button` props. Vetoed while the
 * drawer is `disabled`.
 */
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
  /**
   * Title text/content. Rendered as a `Heading` through base-ui's `Drawer.Title`,
   * so it also becomes the drawer's accessible name.
   */
  title?: React.ReactNode;
  /**
   * Supporting text. Rendered as a `Text` through base-ui's `Drawer.Description`,
   * so it also becomes the drawer's accessible description.
   */
  subtitle?: React.ReactNode;
  /** Document-outline level for the rendered title heading. Default `3`. */
  level?: HeadingLevel;
  /**
   * Overflow actions for the header, rendered as a `Menu` behind an icon-only
   * "more options" trigger. Each entry a `<Menu.Item>`. For secondary actions;
   * the footer's `actions` is the primary button row.
   */
  actions?: MenuProps["items"];
  /** Accessible name for the header actions menu trigger. Default `"Actions"`. */
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
  /**
   * The footer's primary actions, rendered as a joined `ButtonGroup` at the
   * footer's end. Each entry is a `ButtonGroup.Item` element (see
   * {@link ButtonGroupProps.items}). Use this for the main button row; the
   * header's `actions` is for a secondary overflow menu.
   */
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
  /** Spread onto `<Drawer>` to bind its controlled open state. */
  drawerProps: Pick<DrawerProps, "open" | "onOpenChange">;
}

/**
 * Manages a `Drawer`'s open state from the parent. Returns open/close/toggle
 * controls plus a `drawerProps` bundle to spread onto `<Drawer>`. Use it when
 * the drawer must be driven from outside its trigger — opened from a menu item,
 * or closed after an async action. To only close without owning the open state,
 * prefer `useOverlayHandle(Drawer)`.
 */
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

/** Drawer with its compound parts attached. */
export const Drawer = Object.assign(DrawerRoot, {
  Trigger: DrawerTrigger,
  Close: DrawerClose,
  Header: DrawerHeader,
  Footer: DrawerFooter,
  /**
   * Creates a detached imperative handle (base-ui's `createHandle`). Prefer
   * `useOverlayHandle(Drawer)` inside components; reach for this only when the
   * handle must live outside React (module scope, detached triggers).
   */
  createHandle: BaseDrawer.createHandle,
});
