"use client";
import { Tooltip } from "@base-ui/react/tooltip";
import * as React from "react";
import { cx } from "../../../utils/cx";
import { tooltipArrow, tooltipPopup } from "./internalTooltip.css";

type RootProps = React.ComponentProps<typeof Tooltip.Root>;
type TriggerProps = React.ComponentProps<typeof Tooltip.Trigger>;
type PositionerProps = React.ComponentProps<typeof Tooltip.Positioner>;

export interface InternalTooltipProps {
  /**
   * The trigger — a single React element the tooltip attaches to (rendered via
   * base-ui's `render`, so it stays the actual focusable/hoverable element).
   */
  children: React.ReactElement;
  /**
   * Tooltip content. Keep it supplemental — the control must stay fully operable
   * for someone who never sees the tooltip (see the component note).
   */
  content: React.ReactNode;
  /** Disables the tooltip so it can never open; the trigger stays mounted. */
  disabled?: RootProps["disabled"];
  /** Controlled open state. */
  open?: RootProps["open"];
  /** Uncontrolled initial open state. */
  defaultOpen?: RootProps["defaultOpen"];
  /** Called when the open state changes (base-ui signature). */
  onOpenChange?: RootProps["onOpenChange"];
  /** How long to wait before opening on hover, in ms (base-ui default 600). */
  delay?: TriggerProps["delay"];
  /** How long to wait before closing, in ms (base-ui default 0). */
  closeDelay?: TriggerProps["closeDelay"];
  /** Which side of the trigger to place the tooltip (base-ui default 'top'). */
  side?: PositionerProps["side"];
  /** Alignment along the chosen side. */
  align?: PositionerProps["align"];
  /** Gap in px between the trigger and the tooltip. */
  sideOffset?: PositionerProps["sideOffset"];
  /** Extra className merged onto the popup surface. */
  className?: string;
}

/**
 * InternalTooltip — a thin wrapper over base-ui's `Tooltip` that owns the
 * design system's tooltip surface styling. Fully accessible: base-ui handles
 * ARIA wiring, keyboard focus, and dismissal, composed the way `Button` uses
 * base-ui directly.
 *
 * **Internal by design — not exported.** Not because it's inaccessible, but
 * because consumers shouldn't *rely* on the tooltip pattern: even a correct
 * tooltip is invisible to touch users, so it's composed only where clearly
 * supplemental (e.g. explaining a disabled `Button`). Consumer-facing
 * disclosure should use `Popover` once it lands.
 *
 * Content here must stay supplemental — the UI must remain fully operable for
 * someone who never sees the tooltip.
 */
export function InternalTooltip({
  children,
  content,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
  delay,
  closeDelay,
  side,
  align,
  sideOffset = 6,
  className,
}: InternalTooltipProps) {
  return (
    <Tooltip.Root
      disabled={disabled}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <Tooltip.Trigger render={children} delay={delay} closeDelay={closeDelay} />
      <Tooltip.Portal>
        <Tooltip.Positioner side={side} align={align} sideOffset={sideOffset}>
          <Tooltip.Popup className={cx(tooltipPopup, className)}>
            <Tooltip.Arrow className={tooltipArrow} />
            {content}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
