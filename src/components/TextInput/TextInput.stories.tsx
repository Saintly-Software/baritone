import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { Text } from "../Text";
import { FORM_STATES, type FormState, SIZES } from "../../theme/constants";
import { TextInput } from "./index";

const meta: Meta<typeof TextInput> = {
  title: "Form Controls/TextInput",
  component: TextInput,
  args: {
    label: "Email",
    placeholder: "you@example.com",
    state: "neutral",
    size: "md",
  },
  argTypes: {
    state: { control: "select", options: FORM_STATES },
    size: { control: "select", options: SIZES },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof TextInput>;

export const Playground: Story = {};

// One message slot now: the copy changes with the state, rather than a help
// line and an error line coexisting.
const STATE_MESSAGE: Record<FormState, string | undefined> = {
  neutral: undefined,
  warning: "This value seems unusual.",
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

/** Every validation state (rows) against the rendered input (right column). */
export const States: Story = {
  render: () => (
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={thStyle}>State</th>
          <th style={thStyle}>TextInput</th>
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
                <TextInput
                  label="Email"
                  placeholder="Type here"
                  state={state}
                  helpText={STATE_MESSAGE[state]}
                  defaultValue={state === "valid" ? "looks good" : undefined}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {SIZES.map((size) => (
        <TextInput key={size} label={`Size ${size}`} size={size} placeholder={size} />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    label: "Disabled (still focusable)",
    disabled: true,
    helpText: "Uses aria-disabled so it stays keyboard-reachable.",
    defaultValue: "cannot edit",
  },
};

export const Multiline: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      <TextInput
        multiline
        label="Notes"
        placeholder="Anything we should know?"
        helpText="Drag the corner to make it taller."
      />
      <TextInput
        multiline
        rows={6}
        label="Bio (rows=6)"
        defaultValue={"Multiple\nlines\nof\ntext"}
      />
      <TextInput
        multiline
        rows={3}
        state="invalid"
        label="Feedback"
        helpText="Please tell us a little more."
      />
    </div>
  ),
};

export const WithInfo: Story = {
  args: {
    label: "API key",
    placeholder: "sk-…",
    info: (
      <Text render={<p />} variant="sm">
        Find your key in Settings → Developer. It's shown only once.
      </Text>
    ),
    slotProps: { info: { "aria-label": "About API keys" } },
  },
};
