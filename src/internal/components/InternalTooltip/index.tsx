"use client";
import { Tooltip } from "@base-ui/react/tooltip";
import * as React from "react";
import { cx } from "../../../utils/cx";
import { tooltipArrow, tooltipPopup } from "./internalTooltip.css";

type RootProps = React.ComponentProps<typeof Tooltip.Root>;
type TriggerProps = React.ComponentProps<typeof Tooltip.Trigger>;
type PositionerProps = React.ComponentProps<typeof Tooltip.Positioner>;

export interface InternalTooltipProps {
  children: React.ReactElement;

  content: React.ReactNode;

  disabled?: RootProps["disabled"];

  open?: RootProps["open"];

  defaultOpen?: RootProps["defaultOpen"];

  onOpenChange?: RootProps["onOpenChange"];

  delay?: TriggerProps["delay"];

  closeDelay?: TriggerProps["closeDelay"];

  side?: PositionerProps["side"];

  align?: PositionerProps["align"];

  sideOffset?: PositionerProps["sideOffset"];

  className?: string;
}

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
