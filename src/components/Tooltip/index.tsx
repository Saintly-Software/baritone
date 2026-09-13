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

/**
 * Carries the tooltip's description wiring (which base-ui leaves to the consumer)
 * to the compound `Tooltip.Trigger`: the surface's id, and the id to describe the
 * trigger with — present only while open, so the reference never dangles.
 */
interface TooltipContextValue {
  /** Stable id of the tooltip surface; also the `aria-describedby` target. */
  descriptionId: string;
  /** The id to describe the trigger with — present only while open. */
  describedBy: string | undefined;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

export interface TooltipProps {
  /**
   * The control the tooltip attaches to — typically a `<Tooltip.Trigger>` (a
   * `Button`). Always a real button, so the hint reaches keyboard and touch users;
   * to hint a non-focusable element, use `InaccessibleTooltip`.
   */
  children?: React.ReactNode;
  /** Tooltip text. Keep it supplemental; anything a user *must* read belongs in a `Popover`. */
  content: string;
  /** Disables the tooltip so it can never open; the trigger stays mounted. */
  disabled?: RootProps["disabled"];
  /** Controlled open state. */
  open?: RootProps["open"];
  /** Uncontrolled initial open state. */
  defaultOpen?: RootProps["defaultOpen"];
  /** Called when the open state changes (base-ui signature). */
  onOpenChange?: RootProps["onOpenChange"];
  /** Which side of the trigger to place the tooltip (base-ui default `top`). */
  side?: PositionerProps["side"];
  /** Alignment along the chosen side (base-ui default `center`). */
  align?: PositionerProps["align"];
  /** Gap in px between the trigger and the tooltip. Default `6`. */
  sideOffset?: PositionerProps["sideOffset"];
  /** Extra className merged onto the popup surface. */
  className?: string;
  /** Ref to the popup surface element. */
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * A small, supplemental hint in a floating layer, anchored to a button. Opens on
 * hover **and** focus (never click), and since its trigger is always a real
 * `<button>` it's tap-reachable too. Built on base-ui's `Tooltip`, with the
 * `aria-describedby` wiring added on top. The accessible counterpart to
 * `InaccessibleTooltip`; for anything a user must read, use `Popover`.
 *
 * @example
 * <Tooltip content="Copied to your clipboard">
 *   <Tooltip.Trigger startIcon={<CopyIcon />}>Copy</Tooltip.Trigger>
 * </Tooltip>
 */
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

/**
 * The button the tooltip is anchored to — a `Button`, wired by base-ui to open
 * the hint on hover/focus with the `aria-describedby` link. Must be passed to
 * `<Tooltip>`. A `disabled` trigger stays focusable but suppresses the hint (it
 * explains itself via `disabledReason`). `delay` / `closeDelay` tune the timing.
 */
export type TooltipTriggerProps = ButtonProps & {
  /** How long to wait before opening on hover, in ms (base-ui default `600`). */
  delay?: TriggerProps["delay"];
  /** How long to wait before closing, in ms (base-ui default `0`). */
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

/** Tooltip with its compound parts attached. */
export const Tooltip = Object.assign(TooltipRoot, {
  Trigger: TooltipTrigger,
});
