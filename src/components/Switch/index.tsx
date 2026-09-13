"use client";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import * as React from "react";
import { InternalSwitch } from "../../internal/components/InternalSwitch";
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
import { switchLabelDisabled, switchRow, switchRowDisabled } from "./switch.css";

interface SwitchBaseProps {
  value: boolean;

  onChange: (value: boolean, event: Event) => void;

  labelPosition?: LabelPosition;

  helpText?: React.ReactNode;

  slotProps?: FieldSlotProps;

  "aria-describedby"?: string;

  disabled?: boolean;

  required?: boolean;

  state?: FormState;

  size?: Size;

  name?: string;

  className?: string;
}

type SwitchIconProps =
  | { icon?: undefined; activeIcon?: undefined; inactiveIcon?: undefined }
  | { icon: React.ReactNode; activeIcon?: undefined; inactiveIcon?: undefined }
  | { icon?: undefined; activeIcon: React.ReactNode; inactiveIcon: React.ReactNode };

export type SwitchProps = SwitchBaseProps & SwitchIconProps & FieldLabellingProps;

export function Switch(props: SwitchProps) {
  const {
    value,
    onChange,
    label,
    labelPosition = "end",
    helpText,
    slotProps,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    disabled: disabledProp = false,
    required = false,
    state = "neutral",
    size = "md",
    name,
    className,
    icon,
    activeIcon,
    inactiveIcon,
  } = props as SwitchBaseProps & SwitchIconProps & FieldLabellingInput;

  const labelId = React.useId();
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;

  const onIcon = icon ?? activeIcon;
  const offIcon = icon ?? inactiveIcon;

  const controlProps: FieldControlInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
  };
  assertExclusiveNames(controlProps, "Switch");

  return (
    <Field
      helpText={helpText}
      state={state}
      required={required}
      fit="content"
      disabled={disabled}
      slotProps={slotProps}
    >
      <label className={cx(switchRow({ size, labelPosition }), disabled && switchRowDisabled)}>
        <BaseSwitch.Root
          checked={value}
          onCheckedChange={(checked, details) => onChange(checked, details.event)}
          readOnly={disabled}
          aria-disabled={disabled || undefined}
          required={required}
          name={name}
          {...fieldControlAttrs(controlProps, labelId)}
          render={
            <InternalSwitch
              checked={value}
              disabled={disabled}
              state={state}
              size={size}
              activeIcon={onIcon}
              inactiveIcon={offIcon}
              className={className}
            />
          }
        />
        {label != null && (
          <span id={labelId} className={cx(disabled && switchLabelDisabled)}>
            {label}
          </span>
        )}
      </label>
    </Field>
  );
}
