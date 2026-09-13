"use client";
import { Popover as BasePopover } from "@base-ui/react/popover";
import * as React from "react";
import { InternalButton } from "../../internal/components/InternalButton";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { Icon } from "../Icon";
import { type IconSlot, renderIcon } from "../Icon/renderIcon";
import { Popover, type PopoverProps } from "../Popover";
import { infoButtonSquare } from "./infoButton.css";

export type InfoButtonIntent = Exclude<Intent, "positive">;

const defaultInfoIcon = (
  <Icon>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  </Icon>
);

export interface InfoButtonIconState {
  intent: InfoButtonIntent;
  saliency: Saliency;
  size: Size;
  disabled: boolean;
}

export interface InfoButtonProps {
  "aria-label": string;

  children: React.ReactNode;

  header?: React.ReactNode;

  icon?: IconSlot<InfoButtonIconState>;

  intent?: InfoButtonIntent;

  saliency?: Saliency;

  size?: Size;

  side?: PopoverProps["side"];

  align?: PopoverProps["align"];

  disabled?: boolean;

  disabledReason?: React.ReactNode;

  className?: string;

  ref?: React.Ref<HTMLButtonElement>;
}

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
            children: renderIcon(icon, {
              state: { intent, saliency, size, disabled: disabled ?? false },
            }),
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
