import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button";
import { Chip } from "../Chip";
import { Overflow } from "./index";

const ACTIONS = [
  "Bold",
  "Italic",
  "Underline",
  "Strikethrough",
  "Highlight",
  "Link",
  "Quote",
  "Code",
  "Bulleted list",
  "Numbered list",
  "Indent",
  "Outdent",
  "Align left",
  "Align center",
  "Align right",
];

const meta: Meta<typeof Overflow> = {
  title: "Layout/Overflow",
  component: Overflow,
  args: {
    orientation: "horizontal",
    scrollBy: "item",
    gap: "2",
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    scrollBy: {
      control: "inline-radio",
      options: ["item", "page"],
    },
    gap: {
      control: "select",
      options: ["0", "1", "2", "3", "4", "6", "8"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Overflow>;

/**
 * A toolbar of actions in a deliberately narrow box, so the row overflows: a
 * scrollbar, edge fades, and floating nav buttons appear. Drive `orientation`,
 * `scrollBy`, and `gap` from the toolbar.
 */
export const Playground: Story = {
  render: (args) => (
    <Overflow
      {...args}
      aria-label="Formatting toolbar"
      style={args.orientation === "vertical" ? { maxHeight: 240, width: 220 } : { maxWidth: 420 }}
    >
      {ACTIONS.map((label) => (
        <Button key={label} saliency="mid">
          {label}
        </Button>
      ))}
    </Overflow>
  ),
};

/** The headline case: a horizontal row of controls that scrolls instead of wrapping. */
export const Horizontal: Story = {
  render: () => (
    <Overflow aria-label="Formatting toolbar" style={{ maxWidth: 420 }}>
      {ACTIONS.map((label) => (
        <Button key={label} saliency="mid">
          {label}
        </Button>
      ))}
    </Overflow>
  ),
};

/** Page mode: each nav-button click jumps by one whole viewport. */
export const PageMode: Story = {
  name: "Horizontal (page mode)",
  render: () => (
    <Overflow aria-label="Chips" scrollBy="page" style={{ maxWidth: 420 }}>
      {Array.from({ length: 30 }, (_, i) => (
        <Chip key={i}>{`Tag ${i + 1}`}</Chip>
      ))}
    </Overflow>
  ),
};

/** Vertical orientation: the controls stack and scroll within a bounded height. */
export const Vertical: Story = {
  render: () => (
    <Overflow orientation="vertical" aria-label="Filters" style={{ maxHeight: 260, width: 200 }}>
      {ACTIONS.map((label) => (
        <Button key={label} saliency="mid" width="fill">
          {label}
        </Button>
      ))}
    </Overflow>
  ),
};

/** When everything fits, there's no scrollbar, no fade, and no nav buttons. */
export const FitsNoOverflow: Story = {
  name: "Fits (no overflow chrome)",
  render: () => (
    <Overflow aria-label="Actions" style={{ maxWidth: 600 }}>
      <Button saliency="mid">Save</Button>
      <Button saliency="mid">Duplicate</Button>
      <Button saliency="mid">Delete</Button>
    </Overflow>
  ),
};
