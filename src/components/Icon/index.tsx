"use client";
import * as React from "react";
import { iconRecipe } from "../../styles/recipes/icon.css";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";

export interface IconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  intent?: Intent;

  saliency?: Saliency;

  size?: Size;

  label?: string;

  children?: React.ReactNode;
  ref?: React.Ref<HTMLSpanElement>;
}

export function Icon({
  intent,
  saliency,
  size,
  label,
  className,
  children,
  ref,
  ...rest
}: IconProps) {
  return (
    <span
      ref={ref}
      className={cx(iconRecipe({ intent, saliency, size }), className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      {children}
    </span>
  );
}
