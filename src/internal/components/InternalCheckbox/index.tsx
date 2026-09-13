"use client";
import * as React from "react";
import { focusRingRecipe } from "../../../styles/recipes/focusRing.css";
import type { FormState, Size } from "../../../theme/constants";
import { cx } from "../../../utils/cx";
import { checkboxControl, checkboxIndicator } from "./internalCheckbox.css";

export type InternalCheckboxState = boolean | "indeterminate";

export interface InternalCheckboxProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children"
> {
  checked?: InternalCheckboxState;

  disabled?: boolean;

  size?: Size;

  state?: FormState;

  children?: React.ReactNode;
  ref?: React.Ref<HTMLSpanElement>;
}

function CheckGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="100%"
      height="100%"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3.5 8.5 6.75 11.75 12.5 4.75" />
    </svg>
  );
}

function DashGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="100%"
      height="100%"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M3.75 8 12.25 8" />
    </svg>
  );
}

export function InternalCheckbox({
  checked = false,
  disabled = false,
  size = "md",
  state = "neutral",
  className,
  children,
  ref,
  ...rest
}: InternalCheckboxProps) {
  const indeterminate = checked === "indeterminate";
  const isChecked = checked === true;

  const valueAttrs = {
    "data-checked": isChecked ? "" : undefined,
    "data-unchecked": !isChecked && !indeterminate ? "" : undefined,
    "data-indeterminate": indeterminate ? "" : undefined,
  };

  return (
    <span
      ref={ref}
      className={cx(
        checkboxControl({ size, state }),
        focusRingRecipe({ type: "within", offset: "sm" }),
        className,
      )}
      {...valueAttrs}
      data-disabled={disabled ? "" : undefined}
      {...rest}
    >
      <span className={checkboxIndicator} aria-hidden {...valueAttrs}>
        {indeterminate ? <DashGlyph /> : <CheckGlyph />}
      </span>
      {children}
    </span>
  );
}
