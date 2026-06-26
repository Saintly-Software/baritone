"use client";
import { Tooltip } from "@base-ui/react/tooltip";
import * as React from "react";
import { cx } from "../../../utils/cx";
import { tooltipPopup, tooltipPositioner } from "./internalTooltip.css";

type RootProps = React.ComponentProps<typeof Tooltip.Root>;
type TriggerProps = React.ComponentProps<typeof Tooltip.Trigger>;
type PositionerProps = React.ComponentProps<typeof Tooltip.Positioner>;

export interface InternalTooltipProps {
  /**
   * The trigger. A single React element that the tooltip attaches to (rendered
   * via base-ui's `render`, so it stays the actual focusable/hoverable element —
   * no extra wrapper).
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
 * InternalTooltip — a thin wrapper over base-ui's `Tooltip` that owns the design
 * system's tooltip surface styling.
 *
 * The tooltip is fully accessible: base-ui handles the ARIA wiring, keyboard
 * focus, and dismissal, and it's composed here exactly the way `Button` uses
 * base-ui directly.
 *
 * **Internal by design — not exported from the package.** This isn't about the
 * component being inaccessible; it's that we don't want consumers *relying* on
 * the tooltip pattern. Even a correct tooltip is invisible to touch users and
 * easy to overlook, which is why tooltips so often end up carrying information
 * they shouldn't. The system keeps it internal and composes it only where it's
 * clearly supplemental (e.g. explaining a disabled `Button`); consumer-facing
 * disclosure should use `Popover` once it lands.
 *
 * Content here must stay supplemental — the UI has to remain fully operable for
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
        <Tooltip.Positioner
          className={tooltipPositioner}
          side={side}
          align={align}
          sideOffset={sideOffset}
        >
          <Tooltip.Popup className={cx(tooltipPopup, className)}>{content}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
