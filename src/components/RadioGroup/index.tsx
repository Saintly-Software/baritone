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

/** Layout direction of the option list. */
export type RadioGroupOrientation = "vertical" | "horizontal";

/**
 * Shared knobs the group hands down to every `RadioGroupItem` via context, so an
 * item never repeats `size`/`state` (the render-prop only carries the type `T`).
 */
interface RadioGroupItemContextValue {
  size: Size;
  state: FormState;
}

const RadioGroupItemContext = React.createContext<RadioGroupItemContextValue>({
  size: "md",
  state: "neutral",
});

export interface RadioGroupItemProps<T> {
  /**
   * The value this option selects, constrained to the group's `T` so an
   * out-of-union value is a compile error.
   */
  value: T;
  /**
   * The visible label. Defaults to the stringified `value` (handy for string
   * enums); pass children for anything richer or for non-string values.
   */
  children?: React.ReactNode;
  /**
   * Disable just this option (the group can also be disabled as a whole).
   * Modelled with `aria-disabled` + `readOnly` so the radio stays focusable.
   */
  disabled?: boolean;
  /** Extra className merged onto the item's `<label>`. */
  className?: string;
}

/** Best-effort default label so `<RadioGroupItem value="dark" />` renders "dark". */
function defaultLabel(value: unknown): React.ReactNode {
  return typeof value === "string" || typeof value === "number" ? String(value) : null;
}

/**
 * One radio option. A stable module-level component (not re-created per render)
 * so React reconciles it normally; narrowing to `T` happens purely at the type level.
 */
function RadioGroupItem<T>({
  value,
  children,
  disabled = false,
  className,
}: RadioGroupItemProps<T>) {
  const { size, state } = React.useContext(RadioGroupItemContext);
  // `role="radio"` lives on a span, so a wrapping `<label>` only names the hidden,
  // aria-hidden input — point `aria-labelledby` at the label text instead.
  const labelId = React.useId();
  const content = children ?? defaultLabel(value);
  return (
    <label className={cx(radioItem({ size }), disabled && radioItemDisabled, className)}>
      <Radio.Root
        value={value}
        // `readOnly` + `aria-disabled` (not `disabled`) keeps the option tabbable
        // while base-ui vetoes selecting it.
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
  /** The currently selected value (controlled). */
  value: T;
  /**
   * Called with the newly selected value first and the raw DOM event that drove
   * the selection second (base-ui's native `event`).
   */
  onChange: (value: T, event: Event) => void;
  /**
   * Render-prop children. Receives a `RadioGroupItem` already bound to this
   * group's `T`, so every `<RadioGroupItem value={...} />` is type-checked against it.
   */
  children: (props: {
    RadioGroupItem: (props: RadioGroupItemProps<T>) => React.ReactNode;
  }) => React.ReactNode;
  /** Validation state. `invalid` maps to negative, `valid` to positive. */
  state?: FormState;
  /** Control size. Default `md`. */
  size?: Size;
  /** Lay the options out in a column (default) or a row. */
  orientation?: RadioGroupOrientation;
  /** Inline help under the options, wired to the group's `aria-describedby`. */
  helpText?: React.ReactNode;
  /** Where the label sits. `top` (default) stacks it above; `start`/`end` inline it. */
  labelPosition?: LabelPosition;
  /** Per-slot overrides for the label / help-text pieces. */
  slotProps?: FieldSlotProps;
  /** Mark the group required — marks the label and sets the group `aria-required`. */
  required?: boolean;
  /** Disable the whole group. */
  disabled?: boolean;
  /** Identifies the field when submitted as part of a form. */
  name?: string;
  /** Points the group at extra descriptive text; combines with `helpText`. */
  "aria-describedby"?: string;
  /** Extra className merged onto the radiogroup element. */
  className?: string;
}

/**
 * Named by exactly one of `label` / `aria-label` / `aria-labelledby` — they're
 * mutually exclusive (see `FieldLabellingProps`).
 */
export type RadioGroupProps<T> = RadioGroupBaseProps<T> & FieldLabellingProps;

/**
 * RadioGroup — a "form control" for picking one value from a small set. Built
 * on base-ui's `RadioGroup` (roving focus, arrow keys, ARIA wiring), composing
 * `Field` for label/help/error layout, like `TextInput`.
 *
 * It's a **type-safe compound component**: generic over the value type `T`
 * (inferred from `value`), handing the render-prop a `RadioGroupItem` bound to
 * that `T` — so options can only ever be values from the same union/enum. See
 * https://tkdodo.eu/blog/building-type-safe-compound-components
 *
 * @example
 * type ThemeValue = "system" | "light" | "dark";
 * <RadioGroup value={value} onChange={onChange}>
 *   {({ RadioGroupItem }) => (
 *     <>
 *       <RadioGroupItem value="dark" />
 *       <RadioGroupItem value="light" />
 *       <RadioGroupItem value="system" />
 *     </>
 *   )}
 * </RadioGroup>
 */
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

  // see `useIsFieldDisabled`
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;
  // Everything the control's focusable element needs from the field — see `fieldControlAttrs`.
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
          // The `Field` marks the label; base-ui turns this into `aria-required`.
          required={required}
          // Group disable goes through `readOnly` (base-ui forwards it to every radio)
          // + `aria-disabled`, so options stay keyboard-reachable.
          readOnly={disabled}
          aria-disabled={disabled || undefined}
          name={name}
          // base-ui's `Field.Label` already names the group; this only covers the label-less arms.
          {...fieldControlAttrs(controlProps)}
          className={cx(radioGroupRoot({ orientation }), disabled && radioGroupDisabled, className)}
        >
          {children({
            // The stable generic item, narrowed to `T` — a type-level cast only; the
            // runtime function is the same.
            RadioGroupItem: RadioGroupItem as (props: RadioGroupItemProps<T>) => React.ReactNode,
          })}
        </BaseRadioGroup>
      </RadioGroupItemContext.Provider>
    </Field>
  );
}
