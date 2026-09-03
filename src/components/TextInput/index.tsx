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

/** Per-slot overrides for the label / help-text / info pieces. */
export type TextInputSlotProps = FieldSlotProps;

/**
 * Props shared by the single-line (`<input>`) and multiline (`<textarea>`) arms.
 * The `multiline`/`size`/`rows` triad lives on the arms below instead, so only
 * single-line inputs take `size`, only `<textarea>`s take `rows`.
 */
interface TextInputBaseProps {
  /** Validation state. `invalid` maps to negative, `valid` to positive. */
  state?: FormState;
  /** Inline help under the control, wired to its `aria-describedby`. */
  helpText?: React.ReactNode;
  /**
   * Extra explanation shown in an `InfoButton` next to the `label`; rendered only
   * when there's a visible `label`. Name the button via `slotProps.info["aria-label"]`
   * (default "More information").
   */
  info?: React.ReactNode;
  /** Where the label sits. `top` (default) stacks it above; `start`/`end` inline it. */
  labelPosition?: LabelPosition;
  /** Per-slot overrides for the label / help-text / info pieces. */
  slotProps?: TextInputSlotProps;
  /** Mark the field required — marks the label and the `<input>`/`<textarea>`. */
  required?: boolean;
  /** Uses `aria-disabled` + `readOnly` (keeps the field keyboard-focusable). */
  disabled?: boolean;
}

/** Single-line variant — a native `<input>` sized by `size`. */
export interface SingleLineTextInputProps
  extends
    TextInputBaseProps,
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "size" | "onChange" | "aria-label" | "aria-labelledby"
    > {
  multiline?: false;
  /** Control size. Default `md`. Mutually exclusive with `multiline` / `rows`. */
  size?: Size;
  /**
   * Called on input with the string value first and the raw change event second
   * — the shared form-control shape. Read the value from the first argument, not
   * `event.target.value`.
   */
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  ref?: React.Ref<HTMLInputElement>;
}

/** Multiline variant — a native `<textarea>` whose height is governed by `rows`. */
export interface MultilineTextInputProps
  extends
    TextInputBaseProps,
    Omit<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      "size" | "onChange" | "aria-label" | "aria-labelledby"
    > {
  multiline: true;
  /** Visible rows (the textarea's starting height). Default `3`. */
  rows?: number;
  /**
   * Called on input with the string value first and the raw change event second
   * — the shared form-control shape. Read the value from the first argument, not
   * `event.target.value`.
   */
  onChange?: (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  ref?: React.Ref<HTMLTextAreaElement>;
}

/**
 * Discriminated on `multiline`: a single-line `<input>` (with `size`) or a
 * multiline `<textarea>` (with `rows`) — passing the wrong one is a compile error.
 * Intersected with `FieldLabellingProps`: exactly one of `label` / `aria-label` /
 * `aria-labelledby` may name the input.
 */
export type TextInputProps = (SingleLineTextInputProps | MultilineTextInputProps) &
  FieldLabellingProps;

// One permissive shape for internal destructuring, widening multiline/size/rows/ref
// and merging both attribute sets; the public `TextInputProps` union keeps callers honest.
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

/**
 * TextInput — a "form control" composing `Field`, which owns the label/help/error
 * layout and ARIA wiring. Takes a `state` instead of intent/saliency; disabled uses
 * `aria-disabled` so the field stays focusable (e.g. for an explanatory tooltip).
 *
 * Set `multiline` to render a `<textarea>` sized by `rows` (single-line inputs take
 * `size` instead — mutually exclusive). An `info` node adds an `InfoButton` next to
 * the label, `labelPosition` inlines the label, and `slotProps` re-tunes the label /
 * helpText / info slots.
 *
 * Name it with exactly one of `label`, `aria-label`, or `aria-labelledby` (mutually
 * exclusive). `onChange` follows the shared form-control shape: string value first,
 * raw change event second — read the value from the first argument, not
 * `event.target.value`.
 *
 * @example
 * <TextInput label="Email" type="email" placeholder="you@example.com" />
 *
 * @example
 * // Controlled: the value arrives first, the raw event second.
 * const [email, setEmail] = React.useState("");
 * <TextInput label="Email" value={email} onChange={(value) => setEmail(value)} />
 *
 * @example
 * // Multiline, with a label InfoButton
 * <TextInput
 *   multiline
 *   rows={4}
 *   label="Notes"
 *   info="Markdown is supported."
 *   slotProps={{ info: { "aria-label": "About notes" } }}
 * />
 */
export function TextInput(props: TextInputProps) {
  // see `useIsFieldDisabled`
  const inheritedDisabled = useIsFieldDisabled();

  // The public API is a discriminated union; internally we read from one widened
  // shape (`as unknown as`, since the union's `ref` isn't assignable to the merged type).
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

  // Report the string value first, raw event second — the shared form-control shape.
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
        // The `Field` marks the label; base-ui turns this into `aria-required`.
        required={required}
        aria-disabled={disabled || undefined}
        readOnly={disabled || readOnly}
        // `Field.Label` already names `Field.Control`; this only fills the label-less arms.
        {...fieldNameAttrs({ label, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby })}
        {...rest}
        onChange={handleChange}
      />
    </Field>
  );
}
