"use client";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import * as React from "react";
import { InternalCheckbox } from "../../internal/components/InternalCheckbox";
import type { FormState, LabelPosition, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { checkboxLabelDisabled, checkboxRow, checkboxRowDisabled } from "../Checkbox/checkbox.css";
import {
  Field,
  type FieldLabellingInput,
  type FieldLabellingProps,
  type FieldSlotProps,
  joinIds,
} from "../Field";
import { useIsFieldDisabled } from "../Fieldset";
import { srOnly } from "../SrOnly/srOnly.css";
import { checkboxGroupRoot } from "./checkboxGroup.css";

export type CheckboxGroupOrientation = "vertical" | "horizontal";

interface CheckboxGroupItemContextValue {
  size: Size;
  state: FormState;
  disabled: boolean;

  value: readonly unknown[];

  toggle: (value: unknown, checked: boolean, event: Event) => void;
}

const CheckboxGroupItemContext = React.createContext<CheckboxGroupItemContextValue>({
  size: "md",
  state: "neutral",
  disabled: false,
  value: [],
  toggle: () => {},
});

export interface CheckboxGroupItemProps<T> {
  value: T;

  children?: React.ReactNode;

  disabled?: boolean;

  className?: string;
}

function defaultLabel(value: unknown): React.ReactNode {
  return typeof value === "string" || typeof value === "number" ? String(value) : null;
}

function CheckboxGroupItem<T>({
  value,
  children,
  disabled = false,
  className,
}: CheckboxGroupItemProps<T>) {
  const {
    size,
    state,
    disabled: groupDisabled,
    value: selected,
    toggle,
  } = React.useContext(CheckboxGroupItemContext);
  const itemDisabled = groupDisabled || disabled;
  const checked = selected.includes(value);
  const labelId = React.useId();
  const content = children ?? defaultLabel(value);

  return (
    <label className={cx(checkboxRow({ size }), itemDisabled && checkboxRowDisabled, className)}>
      <BaseCheckbox.Root
        checked={checked}
        onCheckedChange={(next, details) => toggle(value, next, details.event)}
        readOnly={itemDisabled}
        aria-disabled={itemDisabled || undefined}
        aria-labelledby={content != null ? labelId : undefined}
        render={
          <InternalCheckbox checked={checked} disabled={itemDisabled} state={state} size={size} />
        }
      />
      {content != null && (
        <span id={labelId} className={cx(itemDisabled && checkboxLabelDisabled)}>
          {content}
        </span>
      )}
    </label>
  );
}

interface CheckboxGroupBaseProps<T> {
  value: T[];

  onChange: (value: T[], event: Event) => void;

  children: (props: {
    CheckboxGroupItem: (props: CheckboxGroupItemProps<T>) => React.ReactNode;
  }) => React.ReactNode;

  state?: FormState;

  size?: Size;

  orientation?: CheckboxGroupOrientation;

  helpText?: React.ReactNode;

  labelPosition?: LabelPosition;

  slotProps?: FieldSlotProps;

  required?: boolean;

  disabled?: boolean;

  "aria-describedby"?: string;

  className?: string;
}

export type CheckboxGroupProps<T> = CheckboxGroupBaseProps<T> & FieldLabellingProps;

export function CheckboxGroup<T>(props: CheckboxGroupProps<T>) {
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
    className,
  } = props as CheckboxGroupBaseProps<T> & FieldLabellingInput;

  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;
  const nameProps: FieldLabellingInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  };

  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const toggle = React.useCallback(
    (toggled: unknown, checked: boolean, event: Event) => {
      const current = value as readonly T[];
      const next = checked ? [...current, toggled as T] : current.filter((v) => v !== toggled);
      onChangeRef.current(next, event);
    },
    [value],
  );

  const itemContext = React.useMemo<CheckboxGroupItemContextValue>(
    () => ({ size, state, disabled, value: value as readonly unknown[], toggle }),
    [size, state, disabled, value, toggle],
  );

  const requiredHintId = React.useId();

  return (
    <Field
      {...(nameProps as FieldLabellingProps)}
      helpText={helpText}
      state={state}
      required={required}
      labelPosition={labelPosition}
      disabled={disabled}
      slotProps={slotProps}
    >
      {({ nameAttrs, describedBy }) => (
        <CheckboxGroupItemContext.Provider value={itemContext}>
          <div
            role="group"
            {...nameAttrs}
            aria-describedby={joinIds(
              required ? requiredHintId : undefined,
              ariaDescribedby,
              describedBy,
            )}
            className={cx(checkboxGroupRoot({ orientation }), className)}
          >
            {required && (
              <span id={requiredHintId} className={srOnly}>
                Required
              </span>
            )}
            {children({
              CheckboxGroupItem: CheckboxGroupItem as (
                props: CheckboxGroupItemProps<T>,
              ) => React.ReactNode,
            })}
          </div>
        </CheckboxGroupItemContext.Provider>
      )}
    </Field>
  );
}
