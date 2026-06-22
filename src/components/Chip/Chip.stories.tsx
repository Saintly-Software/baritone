import type { Meta, StoryObj } from '@storybook/react-vite';
import { INTENTS, SALIENCIES, SIZES } from '../../theme/constants';
import { Chip } from './index';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  args: { children: 'Chip', intent: 'neutral', saliency: 'mid', size: 'md' },
  argTypes: {
    intent: { control: 'select', options: INTENTS },
    saliency: { control: 'select', options: SALIENCIES },
    size: { control: 'select', options: SIZES },
  },
};
export default meta;

type Story = StoryObj<typeof Chip>;

export const Playground: Story = {};

export const IntentsAndSaliencies: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {INTENTS.map((intent) => (
        <div key={intent} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {SALIENCIES.map((saliency) => (
            <Chip key={saliency} intent={intent} saliency={saliency}>
              {intent}/{saliency}
            </Chip>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {SIZES.map((size) => (
        <Chip key={size} intent="primary" saliency="high" size={size}>
          {size}
        </Chip>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, intent: 'primary', saliency: 'high', children: 'Disabled' },
};

export const AsLink: Story = {
  args: {
    intent: 'secondary',
    saliency: 'low',
    render: <a href="https://example.com" />,
    children: 'Link chip',
  },
};
