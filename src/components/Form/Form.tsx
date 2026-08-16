"use client";
import type * as React from "react";
import { Flex, type FlexProps } from "../Flex";

/**
 * The slice of a TanStack form instance {@link Form} needs — a structural type, so
 * a heavily-generic `useAppForm()` (or plain `useForm()`) result is assignable
 * without threading its ~20 type parameters through here (same rationale as
 * `FieldLike`).
 */
export interface FormApiLike {
  /** Validate, then run the configured `onSubmit`. TanStack's `form.handleSubmit`. */
  handleSubmit: () => void | Promise<void>;
  /**
   * The form-context provider from `useAppForm()` (`form.AppForm`). When present it
   * wraps the children, so `form.SubmitButton` and any other form components resolve
   * their context here — no separate `<form.AppForm>` needed. When absent (a plain
   * `useForm()`), the children render directly and a native `<Button type="submit">`
   * still drives submission.
   */
  AppForm?: React.ComponentType<React.PropsWithChildren>;
}

export interface FormProps extends Omit<FlexProps, "render" | "onSubmit"> {
  /** The form instance from `useAppForm()` (or a plain `useForm()`). */
  form: FormApiLike;
  /**
   * Fires after the browser default is prevented and `form.handleSubmit()` has been
   * kicked off — for side effects like analytics or closing a dialog. You do **not**
   * call `handleSubmit` here; the `<Form>` wires it for you.
   */
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  /** Skip native browser validation — TanStack owns validation. Defaults to `true`. */
  noValidate?: boolean;
}

/**
 * A `<form>` wired to a TanStack form: it prevents the browser default and calls
 * `form.handleSubmit()` on submit, lays its children out as a vertical stack (it
 * *is* a {@link Flex}, so `direction` / `gap` / `maxWidth` / margin / padding props
 * all apply), and — given a `useAppForm()` instance — provides the form context so
 * `form.SubmitButton` works without a wrapping `<form.AppForm>`.
 *
 * @example
 * const form = useAppForm({ defaultValues: { email: "" }, onSubmit });
 * return (
 *   <Form form={form} gap="6" style={{ maxWidth: 360 }}>
 *     <form.AppField name="email">{(f) => <f.TextInput label="Email" />}</form.AppField>
 *     <form.SubmitButton>Save</form.SubmitButton>
 *   </Form>
 * );
 */
export function Form(props: FormProps) {
  const {
    form,
    onSubmit,
    noValidate = true,
    direction = "column",
    gap = "4",
    children,
    ...rest
  } = props;

  const element = (
    <Flex
      direction={direction}
      gap={gap}
      {...rest}
      render={
        <form
          noValidate={noValidate}
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
            onSubmit?.(event);
          }}
        />
      }
    >
      {children}
    </Flex>
  );

  const { AppForm } = form;
  return AppForm ? <AppForm>{element}</AppForm> : element;
}
