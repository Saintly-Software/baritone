import type { Meta, StoryObj } from '@storybook/react-vite';
import { INTENTS, SURFACE_SALIENCIES } from '../../theme/constants';
import { Chip } from '../Chip';
import { Text } from '../Text';
import { Card } from './index';

const meta: Meta<typeof Card> = {
  title: 'Surfaces/Card',
  component: Card,
  args: { intent: 'neutral', saliency: 'low', padding: 'md', as: 'div' },
  argTypes: {
    intent: { control: 'select', options: INTENTS },
    saliency: { control: 'select', options: SURFACE_SALIENCIES },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    as: { control: 'select', options: ['div', 'section', 'main', 'article'] },
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Playground: Story = {
  render: (args) => (
    <Card {...args} style={{ maxWidth: 320 }}>
      <Text render={<p />}>
        A surface that contains other elements. Most surfaces use the neutral
        intent.
      </Text>
    </Card>
  ),
};

export const WithHeaderAndFooter: Story = {
  render: (args) => (
    <Card
      {...args}
      as="section"
      style={{ maxWidth: 360 }}
      header={
        <Card.Header
          title="Card title"
          subtitle="A short supporting subtitle"
        />
      }
      footer={
        <Card.Footer>
          <Chip intent="secondary" saliency="low">
            Cancel
          </Chip>
          <Chip intent="primary" saliency="high">
            Save
          </Chip>
        </Card.Footer>
      }
    >
      <Text render={<p />}>
        The header and footer are passed as props; the content sits between them.
      </Text>
    </Card>
  ),
};

export const BleedAndDivider: Story = {
  render: (args) => (
    <Card {...args} style={{ maxWidth: 360 }}>
      <Card.Header title="Edge-to-edge content" />
      <Card.Bleed>
        <div
          style={{
            height: 120,
            background: 'var(--placeholder, #8884)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Text>full-bleed media</Text>
        </div>
      </Card.Bleed>
      <Text render={<p />}>
        The block above bleeds past the card padding to touch both edges.
      </Text>
      <Card.Divider />
      <Text render={<p />} variant="sm" saliency="low">
        A divider spans the full width too.
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
