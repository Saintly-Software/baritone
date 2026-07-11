"use client";
import { Popover as BasePopover } from "@base-ui/react/popover";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { Icon } from "../Icon";
import { Popover, type PopoverProps } from "../Popover";
import { infoButtonSquare } from "./infoButton.css";

/**
 * InfoButton intents. Excludes `positive` — a success/confirmation colour reads
 * wrong on a neutral "here's some context" affordance.
 */
export type InfoButtonIntent = Exclude<Intent, "positive">;

/** The default "i" glyph, used when no `icon` is supplied. */
const defaultInfoIcon = (
  <Icon>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  </Icon>
);

export interface InfoButtonProps {
  /**
   * Accessible name — **required**, because the button is icon-only and has no
   * visible text to name it (e.g. "More about billing cycles"). The mirror image
   * of `Button`, which _forbids_ `aria-label` because its visible label is
   * already the name.
   */
  "aria-label": string;
  /** The popover body — **required**. Typically a short `Text` paragraph. */
  children: React.ReactNode;
  /**
   * Optional title shown above the body. Rendered through `Popover.Header`, so it
   * also becomes the popover's accessible name.
   */
  header?: React.ReactNode;
  /** The trigger glyph. Defaults to an info "i" `<Icon>`. */
  icon?: React.ReactNode;
  /** Colour scheme of the trigger. Shared with `Button` / `Chip`. Default `neutral`. */
  intent?: InfoButtonIntent;
  /** Prominence of the trigger. Default `low` (a ghost "i"). */
  saliency?: Saliency;
  /** Trigger size; the button is square at every size. Default `sm`. */
  size?: Size;
  /** Which side of the trigger to place the popover (base-ui default `bottom`). */
  side?: PopoverProps["side"];
  /** Alignment along the chosen side (base-ui default `center`). */
  align?: PopoverProps["align"];
  /**
   * Disable the trigger. Modelled with `aria-disabled` (keyboard-focusable, so it
   * can surface `disabledReason`); clicks / keyboard activation are vetoed.
   */
  disabled?: boolean;
  /**
   * Explanation shown in a tooltip when disabled and the user tabs to or hovers
   * the button.
   */
  disabledReason?: React.ReactNode;
  /** Extra className merged onto the trigger button. */
  className?: string;
  /** Ref to the trigger button. */
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * InfoButton — a small icon-only button that opens an informational `Popover`.
 * Use it for the "i" affordance next to a label or field that reveals a short
 * explanation on click.
 *
 * It composes the exported `Popover` (so focus management, `Escape` / outside
 * dismissal, and ARIA wiring come for free) with an icon-only trigger built on
 * the very same `InternalButton` that powers `Button`. Like `ToggleButton`, the
 * `aria-label` and the popover-toggle wiring ride in through `InternalButton`'s
 * `htmlAttrs` seam — base-ui's `Popover.Trigger` supplies the toggle props, and
 * the required `aria-label` names the otherwise-textless button.
 *
 * `intent` / `saliency` / `size` style the trigger (shared with `Button` /
 * `Chip`); the floating surface itself stays the default neutral, low-saliency
 * `Popover`.
 *
 * @example
 * <InfoButton aria-label="About billing cycles">
 *   <Text render={<p />}>Cycles renew on the 1st of each month.</Text>
 * </InfoButton>
 */
export function InfoButton({
  "aria-label": ariaLabel,
  children,
  header,
  icon = defaultInfoIcon,
  intent = "neutral",
  saliency = "low",
  size = "sm",
  side,
  align,
  disabled,
  disabledReason,
  className,
  ref,
}: InfoButtonProps) {
  // The trigger is an icon-only button whose accessible name and popover-toggle
  // wiring both arrive via `InternalButton`'s `htmlAttrs` seam: base-ui's
  // `Popover.Trigger` computes the toggle props (onClick, aria-haspopup,
  // aria-expanded, …) and hands them to `render`, and `aria-label` rides
  // alongside because `InternalButton` strips it from `consumerProps`.
  const trigger = (
    <BasePopover.Trigger
      render={(htmlAttrs) => (
        <InternalButton
          consumerProps={{
            intent,
            saliency,
            size,
            disabled,
            disabledReason,
            className: cx(infoButtonSquare, className),
            ref,
            children: icon,
          }}
          htmlAttrs={{ ...htmlAttrs, "aria-label": ariaLabel }}
        />
      )}
    />
  );

  return (
    <Popover
      trigger={trigger}
      side={side}
      align={align}
      header={header != null ? <Popover.Header title={header} /> : undefined}
    >
      {children}
    </Popover>
  );
}

InfoButton.displayName = "InfoButton";
