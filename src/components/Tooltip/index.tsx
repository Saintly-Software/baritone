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
 * base-ui's tooltip intentionally leaves the description wiring to the consumer
 * (its popup carries no `role`, and the trigger gets no `aria-describedby`). We
 * add it ourselves: the surface is `role="tooltip"` with a stable id, and the
 * trigger points at that id via `aria-describedby` — but only while the tooltip
 * is open, so the reference never dangles once the (unmounted) popup is gone.
 * This context is how the compound `Tooltip.Trigger` learns that id/open state.
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
   * The control the tooltip attaches to — typically a `<Tooltip.Trigger>`, which
   * renders a `Button`. A tooltip is *always* anchored to a real button (never a
   * bare element): a button is focusable and, crucially, tap-reachable, so the
   * hint is available to keyboard and touch users — not just mouse hover. If you
   * need to hint an arbitrary, non-focusable element, that's the deliberate
   * tradeoff `InaccessibleTooltip` exists for.
   */
  children?: React.ReactNode;
  /**
   * Tooltip text. Keep it supplemental — the button must stay fully operable for
   * someone who never sees the tooltip; anything a user *must* read belongs in a
   * `Popover`.
   */
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
 * Tooltip — a small, supplemental hint shown in a floating layer, anchored to a
 * button. It opens on hover **and** focus (never on click), so it reaches
 * keyboard users; because its trigger is always a real `<button>`, it's also
 * tap-reachable on touch — the accessibility gap that keeps the system from
 * exposing a general-purpose tooltip.
 *
 * Built on base-ui's `Tooltip`, so focus/hover handling and dismissal come for
 * free, and it shares the exact surface styling of the system's internal hints.
 * The `aria-describedby` wiring (the tooltip describes its trigger) is added on
 * top — base-ui leaves that to the consumer. It opens from a `<Tooltip.Trigger>`
 * (a `Button`) passed as its child.
 *
 * This is the accessible counterpart to `InaccessibleTooltip`: the same surface,
 * but the button trigger is mandatory rather than the caller's responsibility.
 * Still, keep the content supplemental — for anything a user actually needs to
 * read, reach for `Popover`.
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
  // Track the resolved open state (controlled or not) so the trigger only
  // describes itself while the popup is actually mounted.
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
          <BaseTooltip.Positioner
            side={side}
            align={align}
            sideOffset={sideOffset}
          >
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
 * The button the tooltip is anchored to. Renders a `Button` (so all of Button's
 * intents / saliencies / sizes / icons are available), wired up by base-ui so it
 * opens the hint on hover/focus, plus the `aria-describedby` linking it to the
 * tooltip surface. Must be passed to `<Tooltip>{...}</Tooltip>` so it sits inside
 * the tooltip's context.
 *
 * A `disabled` trigger stays focusable (`aria-disabled`, via `Button`) but
 * *suppresses* the hint — a disabled button explains itself through its own
 * `disabledReason` instead, so the two don't fight over the same surface.
 *
 * `delay` / `closeDelay` tune the open/close timing for this trigger.
 */
export type TooltipTriggerProps = ButtonProps & {
  /** How long to wait before opening on hover, in ms (base-ui default `600`). */
  delay?: TriggerProps["delay"];
  /** How long to wait before closing, in ms (base-ui default `0`). */
  closeDelay?: TriggerProps["closeDelay"];
};

function TooltipTrigger({ delay, closeDelay, ...buttonProps }: TooltipTriggerProps) {
  const context = React.useContext(TooltipContext);
  // A disabled button surfaces its own `disabledReason`; keep the hint out of
  // the way by telling base-ui not to open for a disabled trigger.
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
          // Only merge `aria-describedby` while the popup is mounted, so the
          // reference never points at a removed element (base-ui `mergeProps`
          // clobbers with `undefined`, hence the conditional spread).
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
