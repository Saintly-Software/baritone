import * as React from "react";
import type { FormState } from "../../theme/constants";

/**
 * The slice of a TanStack Form field the adapters actually read — a structural
 * type, not the 23-generic `FieldApi`.
 *
 * A real `field` (from `<form.Field>` / `useFieldContext`) is assignable to this,
 * so `TValue` flowing through makes a mismatched value type a compile error, and
 * components stay testable with a hand-rolled stub instead of the concrete class.
 */
export interface FieldLike<TValue> {
  /** The field's name/path — forwarded to the control's `name` for form submission. */
  readonly name: string;
  /** Commit a new value (TanStack's `field.handleChange`). */
  handleChange: (value: TValue) => void;
  /** Mark the field blurred/touched (TanStack's `field.handleBlur`). */
  handleBlur: () => void;
  readonly state: {
    /** The current value. */
    readonly value: TValue;
    readonly meta: {
      /**
       * Validation errors, in whatever shape the configured validators produce —
       * strings, Standard-Schema `{ message }` issues, or React nodes.
       * {@link firstFieldErrorMessage} extracts a display string.
       */
      readonly errors: readonly unknown[];
      /**
       * Whether the field has been interacted with (TanStack sets this on change
       * or blur) — the default gate for showing errors.
       */
      readonly isTouched: boolean;
    };
  };
}

/** When a field's errors become visible. See {@link resolveFieldDisplay}. */
export type ShowErrorsWhen = "touched" | "always";

/** The extra, field-binding-only props every `Form*` adapter adds to its control. */
export interface FormFieldExtras {
  /**
   * When to surface validation errors as the control's `state="invalid"` +
   * `helpText`. `"touched"` (default) waits until the field has been touched
   * (TanStack's idiomatic UX); `"always"` shows them immediately.
   */
  showErrorsWhen?: ShowErrorsWhen;
}

/**
 * Returns the first error worth showing from a field's error list. Handles
 * strings, `{ message }` issues (Standard Schema, Zod, Valibot, …),
 * numbers/booleans, and React nodes — skipping empty/null entries so a
 * "no error" slot never renders a blank line.
 */
export function firstFieldErrorMessage(
  errors: readonly unknown[] | undefined,
): React.ReactNode | undefined {
  if (errors == null) return undefined;
  for (const error of errors) {
    const node = errorToNode(error);
    if (node != null) return node;
  }
  return undefined;
}

/**
 * Whether a field's error list holds a *real* error, not just a "no error"
 * placeholder (`null`/`undefined`/`false`/`""`) that TanStack leaves for passed
 * validators — so a non-empty array alone doesn't mean invalid. Used to flip a
 * control to `invalid` even when {@link firstFieldErrorMessage} can't extract
 * text, so the field never renders neutral while `form.canSubmit` is `false`.
 */
export function hasFieldError(errors: readonly unknown[] | undefined): boolean {
  if (errors == null) return false;
  return errors.some((error) => error != null && error !== false && error !== "");
}

function errorToNode(error: unknown): React.ReactNode | undefined {
  if (error == null) return undefined;
  if (typeof error === "string") return error.length > 0 ? error : undefined;
  if (typeof error === "number" || typeof error === "boolean") return String(error);
  if (React.isValidElement(error)) return error;
  if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message.length > 0 ? message : undefined;
    // A `{ message }` issue whose message is itself a React node — render it
    // rather than dropping it, which would leave `invalid` with a blank help line.
    if (React.isValidElement(message)) return message;
  }
  return undefined;
}

/** The control props {@link resolveFieldDisplay} derives from a field's state. */
export interface FieldDisplay {
  state: FormState;
  helpText: React.ReactNode;
}

/**
 * The read-only slice {@link resolveFieldDisplay} needs — just the error list and
 * touched flag. Sidesteps `FieldLike<unknown>`'s invariance (its `handleChange`
 * blocks `FieldLike<string>` from being assignable), so a field of any value type flows in.
 */
export interface FieldErrorSource {
  state: { meta: { errors: readonly unknown[]; isTouched: boolean } };
}

/**
 * Translates a field's validation state into the `{ state, helpText }` a
 * Baritone form control renders.
 *
 * A visible error (gated by `showErrorsWhen`) sets `state="invalid"` and
 * replaces `helpText` with the error message; otherwise the caller's `helpText`
 * and `state` pass through unchanged — there's no separate `errorMessage`.
 *
 * Invalidity comes from {@link hasFieldError}, not from whether a message can be
 * extracted: an error lacking a string/element `message` still flips the control
 * to `invalid`, just without help text, rather than rendering neutral while
 * `form.canSubmit` stays `false`.
 */
export function resolveFieldDisplay(
  field: FieldErrorSource,
  options: FormFieldExtras & { helpText?: React.ReactNode; state?: FormState },
): FieldDisplay {
  const { showErrorsWhen = "touched", helpText, state } = options;
  const visible = showErrorsWhen === "always" || field.state.meta.isTouched;
  if (visible && hasFieldError(field.state.meta.errors)) {
    return { state: "invalid", helpText: firstFieldErrorMessage(field.state.meta.errors) };
  }
  return { state: state ?? "neutral", helpText };
}
