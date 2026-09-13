import * as React from "react";
import type { FormState } from "../../theme/constants";

export interface FieldLike<TValue> {
  readonly name: string;

  handleChange: (value: TValue) => void;

  handleBlur: () => void;
  readonly state: {
    readonly value: TValue;
    readonly meta: {
      readonly errors: readonly unknown[];

      readonly isTouched: boolean;
    };
  };
}

export type ShowErrorsWhen = "touched" | "always";

export interface FormFieldExtras {
  showErrorsWhen?: ShowErrorsWhen;
}

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

export interface FieldDisplay {
  state: FormState;
  helpText: React.ReactNode;
}

export interface FieldErrorSource {
  state: { meta: { errors: readonly unknown[]; isTouched: boolean } };
}

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
