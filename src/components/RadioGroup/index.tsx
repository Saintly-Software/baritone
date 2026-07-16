"use client";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
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
 * item never has to repeat the group's `size` / `state`. (The render-prop only
 * carries the *type* `T`; the runtime config flows through here.)
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
   * The value this option selects. Constrained to the group's `T`, so a typo or
   * a value outside the union/enum is a compile error.
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
 * One radio option. Stable module-level component (not re-created per render) so
 * React reconciles it normally; type-narrowing to `T` happens purely at the type
 * level where the group hands it to the render-prop.
 */
function RadioGroupItem<T>({
  value,
  children,
  disabled = false,
  className,
}: RadioGroupItemProps<T>) {
  const { size, state } = React.useContext(RadioGroupItemContext);
  // The visible label and the `role="radio"` element are wired explicitly: the
  // `role="radio"` lives on a span, so a wrapping `<label>` only names the hidden
  // input (which is aria-hidden), not the radio. Point `aria-labelledby` straight
  // at the label text so the radio's accessible name is always the visible label.
  const labelId = React.useId();
  const content = children ?? defaultLabel(value);
  return (
    <label className={cx(radioItem({ size }), disabled && radioItemDisabled, className)}>
      <Radio.Root
        value={value}
        // `readOnly` + `aria-disabled` (not `disabled`) so a disabled option stays
        // in the roving tab order and reachable, while base-ui vetoes selecting it.
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
  /** Called with the newly selected value. */
  onChange: (value: T) => void;
  /**
   * Render-prop children. Receives a `RadioGroupItem` already bound to this
   * group's `T`, so every `<RadioGroupItem value={...} />` is type-checked
   * against the same union/enum the group's `value` came from.
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
  /** Shown (and announced) when `state` is `invalid`. */
  errorMessage?: React.ReactNode;
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
 * RadioGroup — a "form control" element type for picking one value from a small
 * set. Built on base-ui's `RadioGroup` (roving focus, arrow-key navigation, ARIA
 * `radiogroup` wiring) and composing `Field` for the label / help / error layout
 * and ARIA wiring, like `TextInput`.
 *
 * It's a **type-safe compound component**: the group is generic over the value
 * type `T` (inferred from `value`), and hands the render-prop a `RadioGroupItem`
 * bound to that `T`. So the options can only ever be values from the same
 * union/enum — works for any enum, not just one. See
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
    errorMessage,
    labelPosition = "top",
    slotProps,
    required = false,
    disabled: disabledProp = false,
    name,
    className,
  } = props as RadioGroupBaseProps<T> & FieldLabellingInput;

  // A wrapping `Fieldset` can disable the whole group; OR it into the local prop.
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;
  const nameProps: FieldLabellingInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  };
  const itemContext = React.useMemo<RadioGroupItemContextValue>(
    () => ({ size, state }),
    [size, state],
  );

  return (
    <Field
      {...(nameProps as FieldLabellingProps)}
      helpText={helpText}
      errorMessage={errorMessage}
      state={state}
      required={required}
      labelPosition={labelPosition}
      disabled={disabled}
      slotProps={slotProps}
    >
      <RadioGroupItemContext.Provider value={itemContext}>
        <BaseRadioGroup
          value={value}
          onValueChange={(next) => onChange(next)}
          // The `Field` marks the label; base-ui turns this into `aria-required`.
          required={required}
          // Group-level disable also goes through `readOnly` (base-ui forwards it to
          // every radio) + `aria-disabled`, so the options stay keyboard-reachable.
          readOnly={disabled}
          aria-disabled={disabled || undefined}
          name={name}
          // Only spread `aria-describedby` when it's actually set: passing
          // `undefined` through base-ui's prop merge clobbers the `helpText` id
          // coming from the field context. base-ui appends ours to it.
          {...(ariaDescribedby != null && { "aria-describedby": ariaDescribedby })}
          // base-ui's `Field.Label` already names the group, so this only emits an
          // attribute for the label-less arms.
          {...fieldNameAttrs(nameProps)}
          className={cx(radioGroupRoot({ orientation }), disabled && radioGroupDisabled, className)}
        >
          {children({
            // The stable generic item, narrowed to this group's `T`. The cast is
            // purely a type-level instantiation — the runtime function is the same.
            RadioGroupItem: RadioGroupItem as (props: RadioGroupItemProps<T>) => React.ReactNode,
          })}
        </BaseRadioGroup>
      </RadioGroupItemContext.Provider>
    </Field>
  );
}
