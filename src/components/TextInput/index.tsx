"use client";
import { Field } from "@base-ui/react/field";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { formControlRecipe } from "../../styles/recipes/formControl.css";
import { textIntentRecipe, textVariantRecipe } from "../../styles/recipes/text.css";
import { atoms } from "../../styles/sprinkles.css";
import type { FormState, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useIsFieldDisabled } from "../Fieldset";
import { InfoButton, type InfoButtonProps } from "../InfoButton";

const wrapperClass = atoms({ display: "flex", flexDirection: "column", gap: "1" });
// Puts the `info` InfoButton on the same baseline as the label text.
const labelRowClass = atoms({ display: "flex", alignItems: "center", gap: "1" });
const labelClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "high" }),
  textVariantRecipe({ family: "body", size: "sm" }),
);
const descriptionClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "low" }),
  textVariantRecipe({ family: "body", size: "xs" }),
);
const errorClass = cx(
  textIntentRecipe({ intent: "negative", saliency: "high" }),
  textVariantRecipe({ family: "body", size: "xs" }),
);

/**
 * Fold a slot's caller-supplied `className` (base-ui's `string | (state) => …`
 * form) together with the built-in `base` class, returning the function form
 * base-ui always accepts. Keeps our base class and lets the caller add to it.
 */
function mergeSlotClass<S>(
  base: string,
  slot: string | ((state: S) => string | undefined) | undefined,
) {
  return (state: S) => cx(base, typeof slot === "function" ? slot(state) : slot);
}

/**
 * Per-slot overrides for the label / description / info pieces. Every field is
 * partial — you're layering props onto the slot's own defaults, so
 * `slotProps={{ label: { className: "…" }, info: { side: "right" } }}` re-tunes
 * just those pieces. A `className` set here merges onto (doesn't replace) the
 * slot's built-in class.
 */
export interface TextInputSlotProps {
  /** Props for the `Field.Label` above the control. */
  label?: React.ComponentPropsWithoutRef<typeof Field.Label>;
  /** Props for the `Field.Description` below the control. */
  description?: React.ComponentPropsWithoutRef<typeof Field.Description>;
  /**
   * Props for the label's `InfoButton` (only rendered when `info` is set). Use it
   * to override the default `aria-label`, or to tune `side` / `intent` / etc.
   */
  info?: Partial<InfoButtonProps>;
}

/**
 * Props shared by both the single-line (`<input>`) and multiline (`<textarea>`)
 * arms. The `multiline` / `size` / `rows` triad lives on the arms below so the
 * shapes can't drift: only single-line inputs take `size`, only `<textarea>`s
 * take `rows`, and the two are mutually exclusive at the type level.
 */
interface TextInputBaseProps {
  /** Validation state. `invalid` maps to negative, `valid` to positive. */
  state?: FormState;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Shown (and announced) when `state` is `invalid`. */
  errorMessage?: React.ReactNode;
  /**
   * Extra explanation surfaced in an `InfoButton` (the "i" affordance) next to the
   * `label`. Rendered only when there's a visible `label`. Give the button an
   * accessible name via `slotProps.info["aria-label"]` (defaults to "More
   * information").
   */
  info?: React.ReactNode;
  /** Per-slot overrides for the label / description / info pieces. */
  slotProps?: TextInputSlotProps;
  /** Uses `aria-disabled` + `readOnly` (keeps the field keyboard-focusable). */
  disabled?: boolean;
}

/** Single-line variant — a native `<input>` sized by `size`. */
export interface SingleLineTextInputProps
  extends TextInputBaseProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  multiline?: false;
  /** Control size. Default `md`. Mutually exclusive with `multiline` / `rows`. */
  size?: Size;
  ref?: React.Ref<HTMLInputElement>;
}

/** Multiline variant — a native `<textarea>` whose height is governed by `rows`. */
export interface MultilineTextInputProps
  extends TextInputBaseProps,
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  multiline: true;
  /** Visible rows (the textarea's starting height). Default `3`. */
  rows?: number;
  ref?: React.Ref<HTMLTextAreaElement>;
}

/**
 * Discriminated on `multiline`: a single-line `<input>` (with `size`) or a
 * multiline `<textarea>` (with `rows`). TypeScript narrows off the one `multiline`
 * flag, so passing `rows` to an input — or `size` to a textarea — is a compile error.
 */
export type TextInputProps = SingleLineTextInputProps | MultilineTextInputProps;

// One permissive shape for internal destructuring. The *public* `TextInputProps`
// union keeps callers honest; internally we just need every field readable in one
// place, so we widen `multiline`/`size`/`rows`/`ref` and merge both attribute sets.
type TextInputInternalProps = TextInputBaseProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> & {
    multiline?: boolean;
    size?: Size;
    rows?: number;
    className?: string;
    ref?: React.Ref<HTMLInputElement & HTMLTextAreaElement>;
  };

/**
 * TextInput — a "form control" element type built on base-ui's `Field` for label
 * association and ARIA wiring. Takes a `state` instead of intent/saliency.
 * Disabled uses `aria-disabled` so the field stays focusable (e.g. to surface an
 * explanatory tooltip), consistent with the rest of the system.
 *
 * Set `multiline` to render a `<textarea>` whose height is driven by `rows`
 * (single-line inputs take `size` instead — the two are mutually exclusive). An
 * `info` node adds an `InfoButton` next to the label, and `slotProps` re-tunes the
 * label / description / info slots.
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
    description,
    errorMessage,
    info,
    slotProps,
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

  // Split each slot's own `className` out so it merges *onto* the built-in class
  // instead of clobbering it. base-ui's Field parts accept `string` or
  // `(state) => string`; `mergeSlotClass` folds either form onto our base class.
  const { className: labelSlotClass, ...labelSlotProps } = slotProps?.label ?? {};
  const { className: descSlotClass, ...descSlotProps } = slotProps?.description ?? {};

  const controlClass = cx(
    formControlRecipe(multiline ? { state, multiline: true } : { state, size }),
    focusRingRecipe({ type: "visible", offset: "sm" }),
    className,
  );

  return (
    <Field.Root className={wrapperClass} invalid={state === "invalid"}>
      {label != null &&
        (info != null ? (
          <div className={labelRowClass}>
            <Field.Label className={mergeSlotClass(labelClass, labelSlotClass)} {...labelSlotProps}>
              {label}
            </Field.Label>
            <InfoButton aria-label="More information" {...slotProps?.info}>
              {info}
            </InfoButton>
          </div>
        ) : (
          <Field.Label className={mergeSlotClass(labelClass, labelSlotClass)} {...labelSlotProps}>
            {label}
          </Field.Label>
        ))}
      <Field.Control
        ref={ref}
        render={multiline ? <textarea rows={rows} /> : undefined}
        className={controlClass}
        aria-disabled={disabled || undefined}
        readOnly={disabled || readOnly}
        {...rest}
      />
      {description != null && (
        <Field.Description
          className={mergeSlotClass(descriptionClass, descSlotClass)}
          {...descSlotProps}
        >
          {description}
        </Field.Description>
      )}
      {state === "invalid" && errorMessage != null && (
        <Field.Error className={errorClass} match>
          {errorMessage}
        </Field.Error>
      )}
    </Field.Root>
  );
}
