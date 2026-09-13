"use client";
import * as React from "react";
import { focusRingRecipe } from "../../../styles/recipes/focusRing.css";
import type { FormState, Size } from "../../../theme/constants";
import { cx } from "../../../utils/cx";
import { switchThumb, switchThumbIcon, switchTrack } from "./internalSwitch.css";

export interface InternalSwitchProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children"
> {
  checked?: boolean;

  disabled?: boolean;

  size?: Size;

  state?: FormState;

  activeIcon?: React.ReactNode;

  inactiveIcon?: React.ReactNode;

  children?: React.ReactNode;
  ref?: React.Ref<HTMLSpanElement>;
}

export function InternalSwitch({
  checked = false,
  disabled = false,
  size = "md",
  state = "neutral",
  activeIcon,
  inactiveIcon,
  className,
  children,
  ref,
  ...rest
}: InternalSwitchProps) {
  const valueAttrs = {
    "data-checked": checked ? "" : undefined,
    "data-unchecked": !checked ? "" : undefined,
  };

  const thumbIcon = checked ? activeIcon : inactiveIcon;

  return (
    <span
      ref={ref}
      className={cx(
        switchTrack({ size, state }),
        focusRingRecipe({ type: "within", offset: "sm" }),
        className,
      )}
      {...valueAttrs}
      data-disabled={disabled ? "" : undefined}
      {...rest}
    >
      <span className={switchThumb} aria-hidden {...valueAttrs}>
        {thumbIcon != null && <span className={switchThumbIcon}>{thumbIcon}</span>}
      </span>
      {children}
    </span>
  );
}
