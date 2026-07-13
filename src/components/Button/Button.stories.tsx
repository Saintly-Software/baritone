import type { Meta, StoryObj } from "@storybook/react-vite";
import { BODY_SIZES, INTENTS, SALIENCIES, SIZES } from "../../theme/constants";
import { IntentSaliencyMatrix } from "../_stories/IntentSaliencyMatrix";
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
    <IntentSaliencyMatrix intents={INTENTS} saliencies={SALIENCIES}>
      {(intent, saliency) => (
        <Button intent={intent} saliency={saliency}>
          Button
        </Button>
      )}
    </IntentSaliencyMatrix>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {SIZES.map((size) => (
          <Button key={size} intent="primary" saliency="high" size={size}>
            {size}
          </Button>
        ))}
      </div>
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
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Buttons render at every `size`. The icon-only button (bottom row) stays square at every `size` — a 1:1 box of side = the control height.",
      },
    },
  },
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

export const States: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button intent="primary" saliency="high" loading>
        Saving…
      </Button>
      <Button icon={<Plus />} aria-label="Add item" intent="primary" saliency="high" loading />
      <Button intent="primary" saliency="high" disabled>
        Disabled
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The non-default states side by side. `loading` overlays a spinner (on the label, or on the glyph for an icon-only button, where the `aria-label` keeps naming the control while busy); `disabled` dims the control and blocks interaction.",
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
    <IntentSaliencyMatrix intents={INTENTS} saliencies={SALIENCIES}>
      {(intent, saliency) => (
        <Button appearance="text" intent={intent} saliency={saliency}>
          Learn more
        </Button>
      )}
    </IntentSaliencyMatrix>
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
