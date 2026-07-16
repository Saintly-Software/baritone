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
 * Props shared by both the single-line (`<input>`) and multiline (`<textarea>`)
 * arms. The `multiline` / `size` / `rows` triad lives on the arms below so the
 * shapes can't drift: only single-line inputs take `size`, only `<textarea>`s
 * take `rows`, and the two are mutually exclusive at the type level.
 */
interface TextInputBaseProps {
  /** Validation state. `invalid` maps to negative, `valid` to positive. */
  state?: FormState;
  /** Inline help under the control, wired to its `aria-describedby`. */
  helpText?: React.ReactNode;
  /** Shown (and announced) when `state` is `invalid`. */
  errorMessage?: React.ReactNode;
  /**
   * Extra explanation surfaced in an `InfoButton` (the "i" affordance) next to the
   * `label`. Rendered only when there's a visible `label`. Give the button an
   * accessible name via `slotProps.info["aria-label"]` (defaults to "More
   * information").
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
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "aria-label" | "aria-labelledby"> {
  multiline?: false;
  /** Control size. Default `md`. Mutually exclusive with `multiline` / `rows`. */
  size?: Size;
  ref?: React.Ref<HTMLInputElement>;
}

/** Multiline variant — a native `<textarea>` whose height is governed by `rows`. */
export interface MultilineTextInputProps
  extends
    TextInputBaseProps,
    Omit<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      "size" | "aria-label" | "aria-labelledby"
    > {
  multiline: true;
  /** Visible rows (the textarea's starting height). Default `3`. */
  rows?: number;
  ref?: React.Ref<HTMLTextAreaElement>;
}

/**
 * Discriminated on `multiline`: a single-line `<input>` (with `size`) or a
 * multiline `<textarea>` (with `rows`). TypeScript narrows off the one `multiline`
 * flag, so passing `rows` to an input — or `size` to a textarea — is a compile
 * error. Intersected with `FieldLabellingProps`, so exactly one of `label` /
 * `aria-label` / `aria-labelledby` may name the input.
 */
export type TextInputProps = (SingleLineTextInputProps | MultilineTextInputProps) &
  FieldLabellingProps;

// One permissive shape for internal destructuring. The *public* `TextInputProps`
// union keeps callers honest; internally we just need every field readable in one
// place, so we widen `multiline`/`size`/`rows`/`ref` and merge both attribute sets.
type TextInputInternalProps = TextInputBaseProps &
  FieldLabellingInput &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "aria-label" | "aria-labelledby"> &
  Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "size" | "aria-label" | "aria-labelledby"
  > & {
    multiline?: boolean;
    size?: Size;
    rows?: number;
    className?: string;
    ref?: React.Ref<HTMLInputElement & HTMLTextAreaElement>;
  };

/**
 * TextInput — a "form control" element type composing `Field`, which owns the
 * label / help / error layout and the ARIA wiring. Takes a `state` instead of
 * intent/saliency. Disabled uses `aria-disabled` so the field stays focusable
 * (e.g. to surface an explanatory tooltip), consistent with the rest of the
 * system.
 *
 * Set `multiline` to render a `<textarea>` whose height is driven by `rows`
 * (single-line inputs take `size` instead — the two are mutually exclusive). An
 * `info` node adds an `InfoButton` next to the label, `labelPosition` inlines the
 * label, and `slotProps` re-tunes the label / helpText / info slots.
 *
 * Name it with exactly one of `label`, `aria-label`, or `aria-labelledby` — they
 * are mutually exclusive (see `FieldLabellingProps`).
 *
 * @example
 * <TextInput label="Email" type="email" placeholder="you@example.com" />
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
  // A wrapping `Fieldset` can disable the whole group; OR it into the local prop.
  const inheritedDisabled = useIsFieldDisabled();

  // The public API is a discriminated union; internally we read every field from
  // one widened shape. `as unknown as` is needed because the union's `ref`
  // (input XOR textarea) isn't directly assignable to the merged ref type.
  const {
    state = "neutral",
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    helpText,
    errorMessage,
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
    ...rest
  } = props as unknown as TextInputInternalProps;

  const disabled = disabledProp || inheritedDisabled;

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
      errorMessage={errorMessage}
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
        // base-ui's `Field.Label` already names `Field.Control`, so this only
        // emits an attribute for the label-less arms.
        {...fieldNameAttrs({ label, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby })}
        {...rest}
      />
    </Field>
  );
}
