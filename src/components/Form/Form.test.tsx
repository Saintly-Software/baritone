import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { firstFieldErrorMessage, resolveFieldDisplay } from "./fieldError";
import { Form } from "./Form";
import { useAppForm } from "./formHook";

// A minimal, deterministic stub of the slice `resolveFieldDisplay` reads — enough
// to unit-test the gating without spinning up a whole form.
const source = (errors: readonly unknown[], isTouched: boolean) => ({
  state: { meta: { errors, isTouched } },
});

describe("firstFieldErrorMessage", () => {
  it("reads bare strings, `{ message }` issues, and skips empties/nullish", () => {
    expect(firstFieldErrorMessage(["Required"])).toBe("Required");
    expect(firstFieldErrorMessage([{ message: "Too short" }])).toBe("Too short");
    expect(firstFieldErrorMessage([null, "", { message: "" }, "Real"])).toBe("Real");
    expect(firstFieldErrorMessage([])).toBeUndefined();
    expect(firstFieldErrorMessage(undefined)).toBeUndefined();
  });

  it("renders a React node, both bare and under a `{ message }` issue", () => {
    const bare = <span>Bare node</span>;
    expect(firstFieldErrorMessage([bare])).toBe(bare);
    const wrapped = <strong>Too short</strong>;
    expect(firstFieldErrorMessage([{ message: wrapped }])).toBe(wrapped);
  });
});

describe("resolveFieldDisplay", () => {
  it("keeps the caller's helpText/state while clean", () => {
    expect(resolveFieldDisplay(source([], false), { helpText: "Hint", state: "valid" })).toEqual({
      state: "valid",
      helpText: "Hint",
    });
  });

  it("hides errors until touched by default, then shows them as invalid + helpText", () => {
    expect(resolveFieldDisplay(source(["Bad"], false), { helpText: "Hint" })).toEqual({
      state: "neutral",
      helpText: "Hint",
    });
    expect(resolveFieldDisplay(source(["Bad"], true), { helpText: "Hint" })).toEqual({
      state: "invalid",
      helpText: "Bad",
    });
  });

  it("shows errors regardless of touched with showErrorsWhen=always", () => {
    expect(resolveFieldDisplay(source(["Bad"], false), { showErrorsWhen: "always" })).toEqual({
      state: "invalid",
      helpText: "Bad",
    });
  });
});

interface Values {
  email: string;
  terms: boolean;
}

const notEmail = ({ value }: { value: string }) =>
  value.includes("@") ? undefined : "Enter a valid email";

function SignupForm({ onValid }: { onValid?: (value: Values) => void }) {
  const form = useAppForm({
    defaultValues: { email: "", terms: false } as Values,
    onSubmit: ({ value }) => onValid?.(value),
  });
  return (
    <Form form={form}>
      <form.AppField name="email" validators={{ onChange: notEmail }}>
        {(field) => <field.TextInput label="Email" />}
      </form.AppField>
      <form.AppField
        name="terms"
        validators={{ onChange: ({ value }) => (value ? undefined : "You must agree") }}
      >
        {(field) => <field.Checkbox label="I agree" />}
      </form.AppField>
      <form.SubmitButton>Submit</form.SubmitButton>
    </Form>
  );
}

describe("useAppForm + pre-bound field components", () => {
  it("binds the field value to the control and reports it on submit", async () => {
    const user = userEvent.setup();
    const onValid = vi.fn();
    render(<SignupForm onValid={onValid} />);

    const email = screen.getByLabelText("Email");
    await user.type(email, "ada@example.com");
    expect(email).toHaveValue("ada@example.com");

    await user.click(screen.getByRole("checkbox", { name: "I agree" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onValid).toHaveBeenCalledWith({ email: "ada@example.com", terms: true });
  });

  it("shows the error once the field is interacted with, and clears it when fixed", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    const email = screen.getByLabelText("Email");

    // Pristine: the validator hasn't run, so nothing is shown yet.
    expect(screen.queryByText("Enter a valid email")).not.toBeInTheDocument();

    await user.type(email, "nope"); // change marks the field touched
    expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
    expect(email).toHaveAttribute("aria-invalid", "true");

    await user.type(email, "@x.com");
    expect(screen.queryByText("Enter a valid email")).not.toBeInTheDocument();
    expect(email).not.toHaveAttribute("aria-invalid", "true");
  });

  it("reveals a commit-style control's error on change (checkbox marks touched)", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    const terms = screen.getByRole("checkbox", { name: "I agree" });

    // Check then uncheck: the second toggle leaves it invalid, and because the
    // adapter marks touched on change, the error surfaces without any blur.
    await user.click(terms);
    await user.click(terms);
    expect(screen.getByText("You must agree")).toBeInTheDocument();
  });

  it("disables the SubmitButton (aria-disabled) while the form is invalid", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    const submit = screen.getByRole("button", { name: "Submit" });
    const email = screen.getByLabelText("Email");

    await user.type(email, "bad");
    expect(submit).toHaveAttribute("aria-disabled", "true");
    // Focusable-disabled contract (AGENTS.md): the button models "disabled" with
    // `aria-disabled`, never the native attribute, so it stays in the tab order and
    // can still be focused while the form can't submit.
    expect(submit).not.toHaveAttribute("disabled");
    submit.focus();
    expect(submit).toHaveFocus();

    await user.clear(email);
    await user.type(email, "ada@example.com");
    expect(submit).not.toHaveAttribute("aria-disabled", "true");
  });
});

describe("Form", () => {
  it("renders a native <form> and wires submit to handleSubmit — no AppForm needed", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    const onSubmit = vi.fn();
    // A plain form-like value (no `AppForm`) — mirrors a bare `useForm()`.
    const { container } = render(
      <Form form={{ handleSubmit }} onSubmit={onSubmit}>
        <button type="submit">Go</button>
      </Form>,
    );
    expect(container.querySelector("form")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    // The side-effect hook still fires, and the browser default is prevented.
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]?.defaultPrevented).toBe(true);
  });

  it("wraps children in the AppForm context provider when the form supplies one", () => {
    const handleSubmit = vi.fn();
    const AppForm = ({ children }: { children?: ReactNode }) => (
      <div data-testid="app-form">{children}</div>
    );
    render(
      <Form form={{ handleSubmit, AppForm }}>
        <span>inside</span>
      </Form>,
    );
    const provider = screen.getByTestId("app-form");
    expect(provider).toHaveTextContent("inside");
    // The <form> lives inside the provider, so form components resolve context.
    expect(provider.querySelector("form")).toBeInTheDocument();
  });
});
