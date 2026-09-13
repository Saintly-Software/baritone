"use client";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import type { FormState, LabelPosition, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import {
  Field,
  type FieldControlInput,
  type FieldLabellingInput,
  type FieldLabellingProps,
  fieldControlAttrs,
  type FieldSlotProps,
} from "../Field";
import { useIsFieldDisabled } from "../Fieldset";
import {
  radioControl,
  radioGroupDisabled,
  radioGroupRoot,
  radioIndicator,
  radioItem,
  radioItemDisabled,
} from "./radioGroup.css";

export type RadioGroupOrientation = "vertical" | "horizontal";

interface RadioGroupItemContextValue {
  size: Size;
  state: FormState;
}

const RadioGroupItemContext = React.createContext<RadioGroupItemContextValue>({
  size: "md",
  state: "neutral",
});

export interface RadioGroupItemProps<T> {
  value: T;

  children?: React.ReactNode;

  disabled?: boolean;

  className?: string;
}

function defaultLabel(value: unknown): React.ReactNode {
  return typeof value === "string" || typeof value === "number" ? String(value) : null;
}

function RadioGroupItem<T>({
  value,
  children,
  disabled = false,
  className,
}: RadioGroupItemProps<T>) {
  const { size, state } = React.useContext(RadioGroupItemContext);
  const labelId = React.useId();
  const content = children ?? defaultLabel(value);
  return (
    <label className={cx(radioItem({ size }), disabled && radioItemDisabled, className)}>
      <Radio.Root
        value={value}
        readOnly={disabled}
        aria-disabled={disabled || undefined}
        aria-labelledby={content != null ? labelId : undefined}
        className={cx(radioControl({ size, state }), focusRingRecipe({ type: "visible" }))}
      >
        <Radio.Indicator keepMounted className={radioIndicator} />
      </Radio.Root>
      <span id={labelId}>{content}</span>
    </label>
  );
}

interface RadioGroupBaseProps<T> {
  value: T;

  onChange: (value: T, event: Event) => void;

  children: (props: {
    RadioGroupItem: (props: RadioGroupItemProps<T>) => React.ReactNode;
  }) => React.ReactNode;

  state?: FormState;

  size?: Size;

  orientation?: RadioGroupOrientation;

  helpText?: React.ReactNode;

  labelPosition?: LabelPosition;

  slotProps?: FieldSlotProps;

  required?: boolean;

  disabled?: boolean;

  name?: string;

  "aria-describedby"?: string;

  className?: string;
}

export type RadioGroupProps<T> = RadioGroupBaseProps<T> & FieldLabellingProps;

export function RadioGroup<T>(props: RadioGroupProps<T>) {
  const {
    value,
    onChange,
    children,
    state = "neutral",
    size = "md",
    orientation = "vertical",
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    helpText,
    labelPosition = "top",
    slotProps,
    required = false,
    disabled: disabledProp = false,
    name,
    className,
  } = props as RadioGroupBaseProps<T> & FieldLabellingInput;

  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;
  const controlProps: FieldControlInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
  };
  const itemContext = React.useMemo<RadioGroupItemContextValue>(
    () => ({ size, state }),
    [size, state],
  );

  return (
    <Field
      {...(controlProps as FieldLabellingProps)}
      helpText={helpText}
      state={state}
      required={required}
      labelPosition={labelPosition}
      disabled={disabled}
      slotProps={slotProps}
    >
      <RadioGroupItemContext.Provider value={itemContext}>
        <BaseRadioGroup
          value={value}
          onValueChange={(next, details) => onChange(next, details.event)}
          required={required}
          readOnly={disabled}
          aria-disabled={disabled || undefined}
          name={name}
          {...fieldControlAttrs(controlProps)}
          className={cx(radioGroupRoot({ orientation }), disabled && radioGroupDisabled, className)}
        >
          {children({
            RadioGroupItem: RadioGroupItem as (props: RadioGroupItemProps<T>) => React.ReactNode,
          })}
        </BaseRadioGroup>
      </RadioGroupItemContext.Provider>
    </Field>
  );
}
