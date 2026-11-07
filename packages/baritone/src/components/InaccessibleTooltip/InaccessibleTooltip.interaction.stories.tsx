import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { InaccessibleTooltip } from "./index";

const meta: Meta<typeof InaccessibleTooltip> = {
  title: "Interaction Tests/InaccessibleTooltip",
  component: InaccessibleTooltip,
};
export default meta;

type Story = StoryObj<typeof InaccessibleTooltip>;

export const OpensOnHover: Story = {
  render: () => (
    <div style={{ padding: 64 }}>
      <InaccessibleTooltip content="A supplemental hint" delay={0}>
        <button type="button">Hover me</button>
      </InaccessibleTooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole("button", { name: "Hover me" }));
    await waitFor(
      () => expect(within(document.body).getByText("A supplemental hint")).toBeInTheDocument(),
      { timeout: 3000 },
    );
  },
};
