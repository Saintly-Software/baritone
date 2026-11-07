"use client";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { formControlRecipe } from "../../styles/recipes/formControl.css";
import type { FormState, LabelPosition, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import {
  Field,
  type FieldLabellingInput,
  type FieldLabellingProps,
  fieldNameAttrs,
  type FieldSlotProps,
} from "../Field";
import { useIsFieldDisabled } from "../Fieldset";

export type TextInputSlotProps = FieldSlotProps;

interface TextInputBaseProps {
  state?: FormState;

  helpText?: React.ReactNode;

  info?: React.ReactNode;

  labelPosition?: LabelPosition;

  slotProps?: TextInputSlotProps;

  required?: boolean;

  disabled?: boolean;
}

export interface SingleLineTextInputProps
  extends
    TextInputBaseProps,
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "size" | "onChange" | "aria-label" | "aria-labelledby"
    > {
  multiline?: false;

  size?: Size;

  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  ref?: React.Ref<HTMLInputElement>;
}

export interface MultilineTextInputProps
  extends
    TextInputBaseProps,
    Omit<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      "size" | "onChange" | "aria-label" | "aria-labelledby"
    > {
  multiline: true;

  rows?: number;

  onChange?: (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  ref?: React.Ref<HTMLTextAreaElement>;
}

export type TextInputProps = (SingleLineTextInputProps | MultilineTextInputProps) &
  FieldLabellingProps;

type TextInputInternalProps = TextInputBaseProps &
  FieldLabellingInput &
  Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "onChange" | "aria-label" | "aria-labelledby"
  > &
  Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "size" | "onChange" | "aria-label" | "aria-labelledby"
  > & {
    multiline?: boolean;
    size?: Size;
    rows?: number;
    className?: string;
    onChange?: (
      value: string,
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
    ref?: React.Ref<HTMLInputElement & HTMLTextAreaElement>;
  };

export function TextInput(props: TextInputProps) {
  const inheritedDisabled = useIsFieldDisabled();

  const {
    state = "neutral",
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    helpText,
    info,
    labelPosition = "top",
    slotProps,
    required = false,
    disabled: disabledProp,
    readOnly,
    className,
    ref,
    multiline = false,
    size = "md",
    rows = 3,
    onChange,
    ...rest
  } = props as unknown as TextInputInternalProps;

  const disabled = disabledProp || inheritedDisabled;

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> | undefined =
    onChange && ((event) => onChange(event.target.value, event));

  const controlClass = cx(
    formControlRecipe(multiline ? { state, multiline: true } : { state, size }),
    focusRingRecipe({ type: "visible", offset: "sm" }),
    className,
  );

  return (
    <Field
      {...({
        label,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledby,
      } as FieldLabellingProps)}
      helpText={helpText}
      info={info}
      state={state}
      required={required}
      labelPosition={labelPosition}
      disabled={disabled}
      slotProps={slotProps}
    >
      <Field.Control
        ref={ref}
        render={multiline ? <textarea rows={rows} /> : undefined}
        className={controlClass}
        required={required}
        aria-disabled={disabled || undefined}
        readOnly={disabled || readOnly}
        {...fieldNameAttrs({ label, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby })}
        {...rest}
        onChange={handleChange}
      />
    </Field>
  );
}
