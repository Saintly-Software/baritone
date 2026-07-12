import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button";
import { Card } from "../Card";
import { SPACE_KEYS } from "../../theme/constants";
import { CardList } from "./index";

const meta: Meta<typeof CardList> = {
  title: "Surfaces/CardList",
  component: CardList,
  args: { "aria-label": "Settings", gap: "4" },
  argTypes: {
    gap: { control: "select", options: SPACE_KEYS },
  },
};
export default meta;

type Story = StoryObj<typeof CardList>;

export const Basic: Story = {
  render: (args) => (
    <CardList {...args} style={{ maxWidth: 480 }}>
      <Card
        header="Two-factor authentication"
        description="Add an extra layer of security to your account."
        action={
          <Button intent="primary" saliency="high" size="sm">
            Enable
          </Button>
        }
      />
      <Card
        header="Email notifications"
        description="Get notified when someone mentions you."
        action={
          <Button intent="neutral" saliency="mid" size="sm">
            Manage
          </Button>
        }
      />
      <Card
        header="Connected apps"
        subheader="3 apps have access"
        action={
          <Button intent="neutral" saliency="mid" size="sm">
            Review
          </Button>
        }
      />
    </CardList>
  ),
};
