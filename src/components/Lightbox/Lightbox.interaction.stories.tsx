import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Icon } from "../Icon";
import { Lightbox } from "./index";

const ExpandGlyph = () => (
  <Icon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4" strokeLinecap="round" />
    </svg>
  </Icon>
);

const SRC = "https://picsum.photos/id/1025/1200/800";
const ALT = "A dog resting on a wooden floor";

const meta: Meta<typeof Lightbox> = {
  title: "Interaction Tests/Lightbox",
  component: Lightbox,
};
export default meta;

type Story = StoryObj<typeof Lightbox>;

const withTrigger = () => (
  <Lightbox
    src={SRC}
    alt={ALT}
    trigger={
      <Lightbox.Trigger size="sm" saliency="low" aria-label="Expand" icon={<ExpandGlyph />} />
    }
  />
);

export const OpensFromTrigger: Story = {
  name: "Opens from the trigger",
  render: withTrigger,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Expand" }));
    await waitFor(() =>
      expect(within(document.body).getByRole("img", { name: ALT })).toBeInTheDocument(),
    );
  },
};

export const ClosesFromCloseButton: Story = {
  name: "Closes from the close button",
  render: withTrigger,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByRole("button", { name: "Expand" }));
    await waitFor(() => expect(body.getByRole("img", { name: ALT })).toBeInTheDocument());

    await userEvent.click(body.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(body.queryByRole("img", { name: ALT })).not.toBeInTheDocument());
  },
};
