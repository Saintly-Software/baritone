import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { FORM_STATES, type FormState, LABEL_POSITIONS } from "../../theme/constants";
import { formControlRecipe } from "../../styles/recipes/formControl.css";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { cx } from "../../utils/cx";
import { Text } from "../Text";
import { Field } from "./index";

// Field is a layout + ARIA primitive, not a styled control — the stories slot a
// plainly-styled input into it (the same recipes `TextInput` uses) so the label /
// help / error arrangement is what you're actually looking at. The field's `state`
// drives its label / error text; colouring the *control* to match is the composing
// component's job (here, the recipe `TextInput` would apply).
const controlClassFor = (state: FormState = "neutral") =>
  cx(formControlRecipe({ state, size: "md" }), focusRingRecipe({ type: "visible", offset: "sm" }));

const controlClass = controlClassFor("neutral");

const meta: Meta<typeof Field> = {
  title: "Form Controls/Field",
  component: Field,
  args: {
    label: "Email",
    helpText: "We'll never share it.",
    state: "neutral",
    labelPosition: "top",
    fit: "fill",
    required: false,
    disabled: false,
  },
  argTypes: {
    state: { control: "select", options: FORM_STATES },
    required: { control: "boolean" },
    labelPosition: { control: "inline-radio", options: LABEL_POSITIONS },
    fit: { control: "inline-radio", options: ["fill", "content"] },
    disabled: { control: "boolean" },
  },
  render: (args) => (
    <Field {...args}>
      <Field.Control
        required={args.required}
        className={controlClassFor(args.state)}
        placeholder="you@example.com"
      />
    </Field>
  ),
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Field>;

export const Playground: Story = {};

/** The common case: a visible label, a control, and a line of help text. */
export const Basic: Story = {
  args: { label: "Email", helpText: "We'll never share it." },
};

/**
 * `state="invalid"` reveals the `errorMessage` and marks the control
 * `aria-invalid`. The help text stays — both are announced, help first.
 */
export const Invalid: Story = {
  args: {
    label: "Email",
    helpText: "We'll never share it.",
    state: "invalid",
    errorMessage: "That doesn't look like an email address.",
  },
};

/**
 * `labelPosition` moves the label beside the control. `start` / `end` are
 * inline-logical (they flip in RTL) and align the label to the control's first
 * line of text; the help and error text stay under the *control*, not the label.
 */
export const Inline: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      {LABEL_POSITIONS.map((labelPosition) => (
        <Field
          key={labelPosition}
          label="Email"
          labelPosition={labelPosition}
          helpText={`labelPosition="${labelPosition}"`}
        >
          <Field.Control className={controlClass} placeholder="you@example.com" />
        </Field>
      ))}
    </div>
  ),
};

/**
 * `required` marks the label with an asterisk. It's the *visible* half only — the
 * marker is decorative and sits beside the `<label>`, never inside it, so the
 * control still announces "Email", not "Email star". Pass `required` to the
 * control too, for the announced half.
 */
export const Required: Story = {
  args: {
    label: "Email",
    required: true,
    helpText: "We'll send your receipt here.",
  },
};

const thStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  opacity: 0.6,
  textAlign: "left",
  padding: "16px 20px",
  whiteSpace: "nowrap",
  verticalAlign: "top",
};

const cellStyle: CSSProperties = {
  padding: "16px 20px",
  borderTop: "1px solid rgba(128,128,128,0.25)",
  verticalAlign: "top",
};

/** Every validation state against the rendered field. */
export const States: Story = {
  render: () => (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={thStyle}>State</th>
          <th style={thStyle}>Field</th>
        </tr>
      </thead>
      <tbody>
        {FORM_STATES.map((state) => (
          <tr key={state}>
            <th scope="row" style={{ ...thStyle, ...cellStyle }}>
              {state}
            </th>
            <td style={cellStyle}>
              <div style={{ maxWidth: 320 }}>
                <Field
                  label="Email"
                  state={state}
                  helpText={state === "warning" ? "This address looks unusual." : undefined}
                  errorMessage={state === "invalid" ? "This field is required." : undefined}
                >
                  <Field.Control className={controlClassFor(state)} placeholder="you@example.com" />
                </Field>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/**
 * `info` hangs an `InfoButton` beside the label for the explanation that's too
 * long for help text. It sits *next to* the label, never inside it, so it stays
 * out of the control's accessible name.
 */
export const WithInfo: Story = {
  args: {
    label: "API key",
    helpText: "Starts with sk-.",
    info: (
      <Text render={<p />} variant="sm">
        Find your key in Settings → Developer. It's shown only once.
      </Text>
    ),
    slotProps: { info: { "aria-label": "About API keys" } },
  },
};

/**
 * The three ways to name a control are **mutually exclusive** — passing more than
 * one is a type error (and warns at runtime), because `aria-label` /
 * `aria-labelledby` would override the visible `label` and the control would show
 * one name while announcing another.
 */
export const Naming: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      <Field label="Visible label" helpText="label — the right answer nearly always.">
        <Field.Control className={controlClass} />
      </Field>

      <Field aria-label="Search" helpText="aria-label — an invisible name.">
        <Field.Control aria-label="Search" className={controlClass} placeholder="Search…" />
      </Field>

      <>
        <Text render={<p />} id="external-label" variant="sm">
          A label living elsewhere on the page
        </Text>
        <Field aria-labelledby="external-label" helpText="aria-labelledby — name by reference.">
          <Field.Control aria-labelledby="external-label" className={controlClass} />
        </Field>
      </>
    </div>
  ),
};

/**
 * base-ui wires its own components automatically, but a control it can't see —
 * here a bare `<div role="group">` — takes its wiring from the render-prop form
 * of `children`. This is how `CheckboxGroup` and `ToggleGroup` are built.
 */
export const CustomControl: Story = {
  render: () => (
    <Field
      label="Custom control"
      helpText="Wired by hand: nameAttrs + describedBy from the render prop."
    >
      {({ nameAttrs, describedBy }) => (
        <div
          role="group"
          {...nameAttrs}
          aria-describedby={describedBy}
          style={{ display: "flex", gap: 8 }}
        >
          <button type="button">One</button>
          <button type="button">Two</button>
        </div>
      )}
    </Field>
  ),
};
