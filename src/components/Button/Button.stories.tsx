import type { Meta, StoryObj } from "@storybook/react-vite";
import { BODY_SIZES, INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { Icon } from "../Icon";
import { Button } from "./index";

// A throwaway glyph so the start/end icon stories have something to render.
const Sparkle = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.4 6.5L21 11l-6.6 2.5L12 20l-2.4-6.5L3 11l6.6-2.5z" />
    </svg>
  </Icon>
);

// A plus glyph for the icon-only stories.
const Plus = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
    </svg>
  </Icon>
);

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  args: {
    children: "Button",
    intent: "primary",
    saliency: "high",
    size: "md",
    disabled: false,
    loading: false,
  },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    saliency: { control: "select", options: SALIENCIES },
    size: { control: "select", options: SIZES },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const IntentsAndSaliencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {INTENTS.map((intent) => (
        <div key={intent} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {SALIENCIES.map((saliency) => (
            <Button key={saliency} intent={intent} saliency={saliency}>
              {intent}/{saliency}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {SIZES.map((size) => (
        <Button key={size} intent="primary" saliency="high" size={size}>
          {size}
        </Button>
      ))}
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    startIcon: <Sparkle />,
    endIcon: <Sparkle />,
    children: "With icons",
  },
};

export const IconOnly: Story = {
  args: { icon: <Plus />, "aria-label": "Add item", children: undefined },
  parameters: {
    docs: {
      description: {
        story:
          "Pass `icon` + `aria-label` (and no `children`) for a square, icon-only button. The `aria-label` is **required** — it's the accessible name, since there's no visible text. Only offered on the default (`solid`) look, not `appearance=\"text\"`.",
      },
    },
  },
};

export const IconOnlySizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {SIZES.map((size) => (
        <Button
          key={size}
          icon={<Plus />}
          aria-label={`Add (${size})`}
          intent="primary"
          saliency="high"
          size={size}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "The icon-only button stays square at every `size` — a 1:1 box of side = the control height.",
      },
    },
  },
};

export const IconOnlyLoading: Story = {
  args: { icon: <Plus />, "aria-label": "Add item", loading: true, children: undefined },
  parameters: {
    docs: {
      description: {
        story:
          "`loading` overlays a spinner on the glyph; the `aria-label` keeps naming the control while busy.",
      },
    },
  },
};

export const Loading: Story = {
  args: { loading: true, children: "Saving…" },
};

export const Disabled: Story = {
  args: { disabled: true, children: "Disabled" },
};

export const DisabledWithReason: Story = {
  args: {
    disabled: true,
    children: "Publish",
    disabledReason: "Add a title before publishing.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tab to or hover the button to see why it is disabled. The button keeps focus (aria-disabled), so the explanation is reachable by keyboard.",
      },
    },
  },
};

export const TextAppearance: Story = {
  args: { appearance: "text", intent: "primary", children: "Learn more" },
  parameters: {
    docs: {
      description: {
        story:
          '`appearance="text"` renders a hyperlink-style button — underlined text driven by `intent`/`saliency`, with no background or fixed height. `size` and `loading` are replaced by `variant` (a body typography size).',
      },
    },
  },
};

export const TextIntentsAndSaliencies: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {INTENTS.map((intent) => (
        <div key={intent} style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {SALIENCIES.map((saliency) => (
            <Button key={saliency} appearance="text" intent={intent} saliency={saliency}>
              {intent}/{saliency}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const TextVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, alignItems: "baseline" }}>
      {BODY_SIZES.map((variant) => (
        <Button key={variant} appearance="text" intent="primary" variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const TextWithIcons: Story = {
  args: {
    appearance: "text",
    intent: "primary",
    startIcon: <Sparkle />,
    endIcon: <Sparkle />,
    children: "With icons",
  },
};

export const TextInline: Story = {
  render: () => (
    <p style={{ maxWidth: 420 }}>
      Text-appearance buttons sit inline with copy, so you can drop one{" "}
      <Button appearance="text" intent="primary" variant="base">
        right into a sentence
      </Button>{" "}
      when the action is a script-driven navigation rather than an anchor.
    </p>
  ),
};

export const TextDisabled: Story = {
  args: {
    appearance: "text",
    intent: "primary",
    disabled: true,
    children: "Learn more",
    disabledReason: "You need an account to read this.",
  },
};
