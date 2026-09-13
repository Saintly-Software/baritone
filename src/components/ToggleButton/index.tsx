"use client";
import * as React from "react";
import {
  InternalButton,
  type InternalButtonHtmlAttrs,
} from "../../internal/components/InternalButton";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { renderIcon } from "../Icon/renderIcon";
import { toggleButtonSquare } from "./toggleButton.css";

type PressedSlot<T> = T | ((pressed: boolean) => T);

export type ToggleButtonChange = (
  value: boolean,
  event: React.MouseEvent<HTMLButtonElement>,
) => void;

export interface ToggleButtonBaseProps {
  "aria-label": PressedSlot<string>;

  icon: PressedSlot<React.ReactNode>;

  intent?: Intent;

  saliency?: Saliency;

  size?: Size;

  disabled?: boolean;

  disabledReason?: React.ReactNode;

  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

export interface ToggleButtonControlledProps {
  value: boolean;
  defaultValue?: never;

  onChange?: ToggleButtonChange;
}

export interface ToggleButtonUncontrolledProps {
  value?: never;

  defaultValue?: boolean;

  onChange?: ToggleButtonChange;
}

export type ToggleButtonProps = ToggleButtonBaseProps &
  (ToggleButtonControlledProps | ToggleButtonUncontrolledProps);

export function ToggleButton(props: ToggleButtonProps) {
  const {
    "aria-label": ariaLabel,
    icon,
    intent,
    saliency = "high",
    size,
    disabled,
    disabledReason,
    className,
    ref,
  } = props;

  const isControlled = props.value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(props.defaultValue ?? false);
  const pressed = isControlled ? (props.value as boolean) : uncontrolledValue;

  const resolvedLabel = typeof ariaLabel === "function" ? ariaLabel(pressed) : ariaLabel;
  const resolvedIcon = typeof icon === "function" ? icon(pressed) : icon;

  const htmlAttrs: InternalButtonHtmlAttrs = {
    "aria-label": resolvedLabel,
    "aria-pressed": pressed,
    onClick: (event) => {
      const next = !pressed;
      if (!isControlled) setUncontrolledValue(next);
      props.onChange?.(next, event);
    },
  };

  return (
    <InternalButton
      consumerProps={{
        intent,
        saliency: pressed ? saliency : "low",
        size,
        disabled,
        disabledReason,
        className: cx(toggleButtonSquare, className),
        ref,
        children: renderIcon(resolvedIcon),
      }}
      htmlAttrs={htmlAttrs}
    />
  );
}
