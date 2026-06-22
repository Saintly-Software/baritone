import type { Meta, StoryObj } from '@storybook/react-vite';
import { INTENTS, SURFACE_SALIENCIES } from '../../theme/constants';
import { Heading } from '../Heading';
import { Text } from '../Text';
import { Card } from './index';

const meta: Meta<typeof Card> = {
  title: 'Surfaces/Card',
  component: Card,
  args: { intent: 'neutral', saliency: 'low', padding: 'md' },
  argTypes: {
    intent: { control: 'select', options: INTENTS },
    saliency: { control: 'select', options: SURFACE_SALIENCIES },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Playground: Story = {
  render: (args) => (
    <Card {...args} style={{ maxWidth: 320 }}>
      <Heading level="h3" variant="lg">
        Card title
      </Heading>
      <Text render={<p />}>
        A surface that contains other elements. Most surfaces use the neutral
        intent.
      </Text>
    </Card>
  ),
};

export const Saliencies: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      {SURFACE_SALIENCIES.map((saliency) => (
        <Card key={saliency} saliency={saliency} style={{ width: 200 }}>
          <Text render={<p />}>neutral / {saliency}</Text>
        </Card>
      ))}
    </div>
  ),
};

export const NoticeIntents: Story = {
  name: 'Intents (Notice-style)',
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
      {INTENTS.map((intent) => (
        <Card key={intent} intent={intent} saliency="low">
          <Text render={<p />}>Your last payment was {intent}.</Text>
        </Card>
      ))}
    </div>
  ),
};
