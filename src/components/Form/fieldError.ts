import * as React from "react";
import type { FormState } from "../../theme/constants";

/**
 * The slice of a TanStack Form field the adapters actually read — a structural
 * type, deliberately not the 23-generic `FieldApi`.
 *
 * A real `field` (from `<form.Field>` / `<form.AppField>` or `useFieldContext`)
 * is assignable to this, so `<FormTextInput field={field} />` type-checks — and,
 * because `TValue` flows through, wiring a control to a field whose value type
 * doesn't match (a `number` field on a text input) is a compile error rather than
 * a runtime surprise. Depending on the surface instead of the concrete class also
 * keeps these components trivially testable with a hand-rolled stub.
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
       * The field's validation errors, as produced by whatever validators the
       * consumer configured — strings, or Standard-Schema `{ message }` issues,
       * or React nodes. {@link firstFieldErrorMessage} extracts a display string.
       */
      readonly errors: readonly unknown[];
      /**
       * Whether the field has been interacted with. TanStack sets this on any
       * change (via `setFieldValue`) *and* on blur (`handleBlur`), so it reads as
       * "the user has engaged this field" — the default gate for showing errors.
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
   * `helpText`. `"touched"` (default) waits until the user has interacted with the
   * field — TanStack marks it touched on the first change or on blur — matching
   * its idiomatic UX; `"always"` shows them immediately, even before any input.
   */
  showErrorsWhen?: ShowErrorsWhen;
}

/**
 * Reduce a field's error list to the first message worth showing. Handles the
 * shapes validators actually emit: bare strings, `{ message }` issues (Standard
 * Schema, Zod, Valibot, …), numbers/booleans, and React nodes. Empty strings and
 * `null`/`undefined` entries are skipped, so a "no error" slot never renders a
 * blank help line.
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
 * Whether a field's error list holds a *real* error — any entry that isn't a
 * "no error" placeholder (`null` / `undefined` / `false` / `""`). TanStack leaves
 * such placeholders in `meta.errors` for validators that passed, so a non-empty
 * array doesn't by itself mean the field is invalid. Used to flip a control to
 * `invalid` even when {@link firstFieldErrorMessage} can't extract a display string
 * (e.g. a validator returning a bare `{ code, minimum }` object) — otherwise the
 * field would render neutral while `form.canSubmit` stays `false`.
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
 * touched flag. Taking this instead of `FieldLike<unknown>` sidesteps the latter's
 * invariance (its `handleChange` makes `FieldLike<string>` unassignable to
 * `FieldLike<unknown>`), so a field of *any* value type flows in.
 */
export interface FieldErrorSource {
  state: { meta: { errors: readonly unknown[]; isTouched: boolean } };
}

/**
 * Translate a field's validation state into the `{ state, helpText }` a Baritone
 * form control renders — the core of the integration.
 *
 * When there's a visible error (gated by `showErrorsWhen`), the control goes
 * `state="invalid"` and the error message *replaces* `helpText`. Otherwise the
 * caller's own `helpText` / `state` pass through unchanged — so a field can show
 * inline guidance while valid and the error while not, from one `helpText` slot
 * (Baritone's one-message rule; there is no separate `errorMessage`).
 *
 * Invalidity is decided by {@link hasFieldError}, not by whether a message could be
 * extracted: a field whose only error is a non-standard object (no string/element
 * `message`) still flips to `invalid` — just without help text — rather than
 * rendering neutral while `form.canSubmit` stays `false`. Give such fields a string
 * or `{ message }` error to show text.
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
