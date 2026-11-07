import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { FORM_STATES, type FormState, LABEL_POSITIONS } from "../../theme/constants";
import { formControlRecipe } from "../../styles/recipes/formControl.css";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { cx } from "../../utils/cx";
import { Text } from "../Text";
import { Field } from "./index";

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

export const Basic: Story = {
  args: { label: "Email", helpText: "We'll never share it." },
};

export const Invalid: Story = {
  args: {
    label: "Email",
    state: "invalid",
    helpText: "That doesn't look like an email address.",
  },
};

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

export const Required: Story = {
  args: {
    label: "Email",
    required: true,
    helpText: "We'll send your receipt here.",
  },
};

const STATE_MESSAGE: Record<FormState, string | undefined> = {
  neutral: undefined,
  warning: "This address looks unusual.",
  invalid: "This field is required.",
  valid: undefined,
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
                <Field label="Email" state={state} helpText={STATE_MESSAGE[state]}>
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

export const WithInfo: Story = {
  args: {
    label: "API key",
    helpText: "Starts with sk-.",
    info: (
      <Text render={<p />} size="sm">
        Find your key in Settings → Developer. It's shown only once.
      </Text>
    ),
    slotProps: { info: { "aria-label": "About API keys" } },
  },
};

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
        <Text render={<p />} id="external-label" size="sm">
          A label living elsewhere on the page
        </Text>
        <Field aria-labelledby="external-label" helpText="aria-labelledby — name by reference.">
          <Field.Control aria-labelledby="external-label" className={controlClass} />
        </Field>
      </>
    </div>
  ),
};

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
