"use client";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { surfaceRecipe } from "../../styles/recipes/surface.css";
import type { HeadingLevel, Intent, SurfaceSaliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { InternalButton } from "../../internal/components/InternalButton";
import { InternalSpinner } from "../../internal/components/InternalSpinner";
import type { ButtonProps } from "../Button";
import { Heading } from "../Heading";
import { Text } from "../Text";
import {
  drawerBackdrop,
  drawerBody,
  drawerBodyContentLoading,
  drawerFooter,
  drawerHeader,
  drawerHeaderText,
  drawerPopup,
  drawerSpinner,
  drawerViewport,
} from "./drawer.css";

type RootProps = React.ComponentProps<typeof BaseDrawer.Root>;
type PopupProps = React.ComponentProps<typeof BaseDrawer.Popup>;

/** Which edge the drawer slides in from. Default `right`. */
export type DrawerSide = "left" | "right";

/** Internal padding from the spacing scale (mirrors `Popover`'s `padding`). */
export type DrawerPadding = "none" | "sm" | "md" | "lg";

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
  /** Default `neutral` (most surfaces are neutral). */
  intent?: Intent;
  /** `low` (default neutral surface) or `high` (washed). Default `low`. */
  saliency?: SurfaceSaliency;
  /** Internal padding from the spacing scale. Default `md`. */
  padding?: DrawerPadding;
  /** Edge the drawer slides in from. Default `right`. */
  side?: DrawerSide;
  /**
   * Loading state: overlays a spinner on the body content (the header and footer
   * stay visible and interactive, so the drawer can still be closed) and marks
   * the panel `aria-busy`. Purely visual — it does not, on its own, prevent
   * closing; pair with `disabled` for that.
   */
  loading?: boolean;
  /**
   * When `true`, the drawer cannot be closed by any means — Escape, the close
   * button, or swipe are all vetoed (outside-press is always prevented). Use it
   * to keep the user in the panel while a blocking action is in flight.
   */
  disabled?: boolean;
  /** Controlled open state. */
  open?: RootProps["open"];
  /** Uncontrolled initial open state. */
  defaultOpen?: RootProps["defaultOpen"];
  /** Called when the open state changes (base-ui signature). */
  onOpenChange?: RootProps["onOpenChange"];
  /**
   * Imperative handle from `useOverlayHandle(Drawer)`. Lets you close the drawer
   * from code — e.g. after an async action — without lifting `open` into
   * component state. `handle.close()` is still vetoed while `disabled`, and the
   * declarative `.Close` part / controlled `open` keep working alongside it.
   */
  handle?: RootProps["handle"];
  /**
   * Modal behaviour. Default (base-ui) `true`: focus is trapped, page scroll is
   * locked, and the page behind is inert. `'trap-focus'` traps focus but leaves
   * the page scrollable/interactive; `false` is non-modal.
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
 * Drawer — a "surface" element type shown in a panel that slides in from the edge
 * of the screen. Its API mirrors `Popover`: it composes `header` / `footer` props
 * (or `<Drawer.Header>` / `<Drawer.Footer>` children) around its content and takes
 * the same `intent` / `saliency` / `padding` surface knobs.
 *
 * Built on base-ui's `Drawer`, so the ARIA wiring, focus management, and
 * swipe-to-dismiss are handled for you. It opens from a `<Drawer.Trigger>` (a
 * `Button`) passed via `trigger`, slides in from the `right` by default (`left`
 * also supported), and is modal: the backdrop is always rendered (even for nested
 * drawers). Clicking outside never closes it; pass `disabled` to additionally veto
 * Escape, the close button, and swipe while a blocking action is in flight.
 */
function DrawerRoot({
  trigger,
  header,
  footer,
  intent,
  saliency,
  padding,
  side = "right",
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
    // A disabled drawer is non-dismissable: veto every close attempt (Escape, the
    // close button, swipe). Outside-press is already disabled via
    // `disablePointerDismissal` below. `cancel()` stops base-ui from acting on the
    // event, so the panel stays open in both controlled and uncontrolled use.
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
      // `side` is purely visual (CSS); the swipe-to-dismiss gesture follows it.
      swipeDirection={side}
      // Clicking outside never closes the drawer (a deliberate constraint of this
      // component); dismissal is via Escape or an explicit close control.
      disablePointerDismissal
    >
      {trigger}
      <BaseDrawer.Portal>
        {/* Always rendered, even when nested inside another drawer/modal. */}
        <BaseDrawer.Backdrop forceRender className={drawerBackdrop} />
        <BaseDrawer.Viewport className={drawerViewport({ side })}>
          <BaseDrawer.Popup
            ref={ref}
            className={cx(
              surfaceRecipe({ intent, saliency, padding }),
              focusRingRecipe({ type: "visible" }),
              drawerPopup({ side }),
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
 * The trigger that opens the drawer. Renders a `Button` (so all of Button's
 * intents / saliencies / sizes / icons are available), wired up by base-ui so it
 * carries the right `aria-haspopup` / `aria-expanded` and toggles the drawer.
 * Must be passed to `<Drawer trigger={...} />` so it sits inside the drawer's
 * context.
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
  ref?: React.Ref<HTMLDivElement>;
}

function DrawerHeader({
  title,
  subtitle,
  level = 3,
  className,
  children,
  ref,
  ...rest
}: DrawerHeaderProps) {
  return (
    <div ref={ref} className={cx(drawerHeader, className)} {...rest}>
      {(title != null || subtitle != null) && (
        <div className={drawerHeaderText}>
          {title != null && (
            <BaseDrawer.Title render={<Heading level={level} variant="lg" />}>
              {title}
            </BaseDrawer.Title>
          )}
          {subtitle != null && (
            <BaseDrawer.Description render={<Text variant="sm" saliency="low" />}>
              {subtitle}
            </BaseDrawer.Description>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export type DrawerFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
};

function DrawerFooter({ className, children, ref, ...rest }: DrawerFooterProps) {
  return (
    <div ref={ref} className={cx(drawerFooter, className)} {...rest}>
      {children}
    </div>
  );
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
