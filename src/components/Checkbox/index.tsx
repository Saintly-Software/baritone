"use client";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import * as React from "react";
import { InternalCheckbox } from "../../internal/components/InternalCheckbox";
import type { FormState, LabelPosition, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import {
  Field,
  type FieldControlInput,
  type FieldLabellingInput,
  type FieldLabellingProps,
  fieldControlAttrs,
  type FieldSlotProps,
  assertExclusiveNames,
} from "../Field";
import { useIsFieldDisabled } from "../Fieldset";
import { checkboxLabelDisabled, checkboxRow, checkboxRowDisabled } from "./checkbox.css";

interface CheckboxBaseProps {
  value: boolean;

  onChange: (value: boolean, event: Event) => void;

  indeterminate?: boolean;

  labelPosition?: LabelPosition;

  slotProps?: FieldSlotProps;

  "aria-describedby"?: string;

  disabled?: boolean;

  required?: boolean;

  state?: FormState;

  helpText?: React.ReactNode;

  size?: Size;

  name?: string;

  className?: string;
}

export type CheckboxProps = CheckboxBaseProps & FieldLabellingProps;

export function Checkbox(props: CheckboxProps) {
  const {
    value,
    onChange,
    indeterminate = false,
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    labelPosition = "end",
    slotProps,
    disabled: disabledProp = false,
    required = false,
    state = "neutral",
    helpText,
    size = "md",
    name,
    className,
  } = props as CheckboxBaseProps & FieldLabellingInput;

  const labelId = React.useId();
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;

  const controlProps: FieldControlInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
  };
  assertExclusiveNames(controlProps, "Checkbox");

  return (
    <Field
      helpText={helpText}
      state={state}
      required={required}
      fit="content"
      disabled={disabled}
      slotProps={slotProps}
    >
      <label className={cx(checkboxRow({ size, labelPosition }), disabled && checkboxRowDisabled)}>
        <BaseCheckbox.Root
          checked={value}
          indeterminate={indeterminate}
          onCheckedChange={(checked, details) => onChange(checked, details.event)}
          readOnly={disabled}
          aria-disabled={disabled || undefined}
          required={required}
          name={name}
          {...fieldControlAttrs(controlProps, labelId)}
          render={
            <InternalCheckbox
              checked={indeterminate ? "indeterminate" : value}
              disabled={disabled}
              state={state}
              size={size}
              className={className}
            />
          }
        />
        {label != null && (
          <span id={labelId} className={cx(disabled && checkboxLabelDisabled)}>
            {label}
          </span>
        )}
      </label>
    </Field>
  );
}
