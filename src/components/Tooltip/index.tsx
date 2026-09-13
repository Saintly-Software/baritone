"use client";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
import {
  tooltipArrow,
  tooltipPopup,
} from "../../internal/components/InternalTooltip/internalTooltip.css";
import { cx } from "../../utils/cx";
import type { ButtonProps } from "../Button";

type RootProps = React.ComponentProps<typeof BaseTooltip.Root>;
type TriggerProps = React.ComponentProps<typeof BaseTooltip.Trigger>;
type PositionerProps = React.ComponentProps<typeof BaseTooltip.Positioner>;

interface TooltipContextValue {
  descriptionId: string;

  describedBy: string | undefined;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

export interface TooltipProps {
  children?: React.ReactNode;

  content: string;

  disabled?: RootProps["disabled"];

  open?: RootProps["open"];

  defaultOpen?: RootProps["defaultOpen"];

  onOpenChange?: RootProps["onOpenChange"];

  side?: PositionerProps["side"];

  align?: PositionerProps["align"];

  sideOffset?: PositionerProps["sideOffset"];

  className?: string;

  ref?: React.Ref<HTMLDivElement>;
}

function TooltipRoot({
  children,
  content,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
  side,
  align,
  sideOffset = 6,
  className,
  ref,
}: TooltipProps) {
  const descriptionId = React.useId();
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const isOpen = open ?? uncontrolledOpen;

  const handleOpenChange: RootProps["onOpenChange"] = (nextOpen, eventDetails) => {
    setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen, eventDetails);
  };

  const contextValue = React.useMemo<TooltipContextValue>(
    () => ({ descriptionId, describedBy: isOpen ? descriptionId : undefined }),
    [descriptionId, isOpen],
  );

  return (
    <TooltipContext.Provider value={contextValue}>
      <BaseTooltip.Root
        disabled={disabled}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={handleOpenChange}
      >
        {children}
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner side={side} align={align} sideOffset={sideOffset}>
            <BaseTooltip.Popup
              ref={ref}
              id={descriptionId}
              role="tooltip"
              className={cx(tooltipPopup, className)}
            >
              <BaseTooltip.Arrow className={tooltipArrow} />
              {content}
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </TooltipContext.Provider>
  );
}

export type TooltipTriggerProps = ButtonProps & {
  delay?: TriggerProps["delay"];

  closeDelay?: TriggerProps["closeDelay"];
};

function TooltipTrigger({ delay, closeDelay, ...buttonProps }: TooltipTriggerProps) {
  const context = React.useContext(TooltipContext);
  const disabled = buttonProps.disabled;
  const describedBy = context?.describedBy;

  return (
    <BaseTooltip.Trigger
      disabled={disabled}
      delay={delay}
      closeDelay={closeDelay}
      render={(htmlAttrs) => (
        <InternalButton
          consumerProps={buttonProps as ButtonProps}
          htmlAttrs={describedBy ? { ...htmlAttrs, "aria-describedby": describedBy } : htmlAttrs}
        />
      )}
    />
  );
}

TooltipRoot.displayName = "Tooltip";
TooltipTrigger.displayName = "Tooltip.Trigger";

export const Tooltip = Object.assign(TooltipRoot, {
  Trigger: TooltipTrigger,
});
