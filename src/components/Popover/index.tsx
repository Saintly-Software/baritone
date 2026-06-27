"use client";
import { Popover as BasePopover } from "@base-ui/react/popover";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { surfaceRecipe } from "../../styles/recipes/surface.css";
import type { HeadingLevel, Intent, SurfaceSaliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { InternalButton } from "../../internal/components/InternalButton";
import type { ButtonProps } from "../Button";
import { Heading } from "../Heading";
import { Text } from "../Text";
import {
  popoverFooter,
  popoverHeader,
  popoverHeaderText,
  popoverPopup,
  popoverPositioner,
} from "./popover.css";

type RootProps = React.ComponentProps<typeof BasePopover.Root>;
type PositionerProps = React.ComponentProps<typeof BasePopover.Positioner>;
type PopupProps = React.ComponentProps<typeof BasePopover.Popup>;

/** Internal padding from the spacing scale (mirrors `Card`'s `padding`). */
export type PopoverPadding = "none" | "sm" | "md" | "lg";

export interface PopoverProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * The element that opens the popover — typically a `<Popover.Trigger>`, which
   * renders a `Button`. Rendered in place (anchored to the page), not inside the
   * floating surface.
   */
  trigger?: React.ReactNode;
  /** Rendered above the content — typically a `<Popover.Header />`. */
  header?: React.ReactNode;
  /** Rendered below the content — typically a `<Popover.Footer />`. */
  footer?: React.ReactNode;
  /** Default `neutral` (most surfaces are neutral). */
  intent?: Intent;
  /** `low` (default neutral surface) or `high` (washed). Default `low`. */
  saliency?: SurfaceSaliency;
  /** Internal padding from the spacing scale. Default `md`. */
  padding?: PopoverPadding;
  /** Controlled open state. */
  open?: RootProps["open"];
  /** Uncontrolled initial open state. */
  defaultOpen?: RootProps["defaultOpen"];
  /** Called when the open state changes (base-ui signature). */
  onOpenChange?: RootProps["onOpenChange"];
  /**
   * Modal behaviour. Default `false`: the rest of the page stays interactive and
   * clicking outside closes the popover. `true` locks scroll and traps focus.
   */
  modal?: RootProps["modal"];
  /** Which side of the trigger to place the popover (base-ui default `bottom`). */
  side?: PositionerProps["side"];
  /** Alignment along the chosen side (base-ui default `center`). */
  align?: PositionerProps["align"];
  /** Gap in px between the trigger and the popover. Default `8`. */
  sideOffset?: PositionerProps["sideOffset"];
  /** Element to focus when the popover opens (base-ui default: first tabbable). */
  initialFocus?: PopupProps["initialFocus"];
  /** Element to focus when the popover closes (base-ui default: the trigger). */
  finalFocus?: PopupProps["finalFocus"];
  /** Extra className merged onto the popup surface. */
  className?: string;
  /** Ref to the popup surface element. */
  ref?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
}

/**
 * Popover — a "surface" element type shown in a floating layer, anchored to a
 * trigger. Its API mirrors `Card`: it composes `header` / `footer` props (or
 * `<Popover.Header>` / `<Popover.Footer>` children) around its content, and
 * takes the same `intent` / `saliency` / `padding` surface knobs.
 *
 * Built on base-ui's `Popover`, so the ARIA wiring, focus management, and
 * dismissal are handled for you. It opens from a `<Popover.Trigger>` (a `Button`)
 * passed via `trigger`, and — being non-modal by default — closes on outside
 * click or `Escape` while leaving the rest of the page interactive.
 */
function PopoverRoot({
  trigger,
  header,
  footer,
  intent,
  saliency,
  padding,
  open,
  defaultOpen,
  onOpenChange,
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
      modal={modal}
    >
      {trigger}
      <BasePopover.Portal>
        <BasePopover.Positioner
          className={popoverPositioner}
          side={side}
          align={align}
          sideOffset={sideOffset}
        >
          <BasePopover.Popup
            ref={ref}
            className={cx(
              surfaceRecipe({ intent, saliency, padding }),
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

/**
 * The trigger that opens the popover. Renders a `Button` (so all of Button's
 * intents / saliencies / sizes / icons are available), wired up by base-ui so it
 * carries the right `aria-haspopup` / `aria-expanded` and toggles the popover.
 * Must be passed to `<Popover trigger={...} />` so it sits inside the popover's
 * context.
 */
export type PopoverTriggerProps = ButtonProps;

function PopoverTrigger(props: PopoverTriggerProps) {
  return (
    <BasePopover.Trigger
      render={(htmlAttrs) => <InternalButton consumerProps={props} htmlAttrs={htmlAttrs} />}
    />
  );
}

/**
 * A control that closes the popover, for use inside a `<Popover.Footer>` (or the
 * content). Renders a `Button`; base-ui wires the dismissal. Defaults to a
 * neutral, low-saliency button — override via the usual `Button` props.
 */
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
  /**
   * Title text/content. Rendered as a `Heading` through base-ui's
   * `Popover.Title`, so it also becomes the popover's accessible name.
   */
  title?: React.ReactNode;
  /**
   * Supporting text. Rendered as a `Text` through base-ui's
   * `Popover.Description`, so it also becomes the popover's accessible
   * description.
   */
  subtitle?: React.ReactNode;
  /** Document-outline level for the rendered title heading. Default `3`. */
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
            <BasePopover.Title render={<Heading level={level} variant="lg" />}>
              {title}
            </BasePopover.Title>
          )}
          {subtitle != null && (
            <BasePopover.Description render={<Text variant="sm" saliency="low" />}>
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

/** Popover with its compound parts attached. */
export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Close: PopoverClose,
  Header: PopoverHeader,
  Footer: PopoverFooter,
});
