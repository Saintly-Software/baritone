import type { Meta, StoryObj } from '@storybook/react-vite';
import { HEADING_LEVELS, TITLE_SIZES } from '../../theme/constants';
import { Heading } from './index';

const meta: Meta<typeof Heading> = {
  title: 'Text/Heading',
  component: Heading,
  args: { children: 'The quick brown fox', level: 2 },
  argTypes: {
    level: { control: 'select', options: HEADING_LEVELS },
    variant: { control: 'select', options: TITLE_SIZES },
  },
};
export default meta;

type Story = StoryObj<typeof Heading>;

export const Playground: Story = {};

export const Levels: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {HEADING_LEVELS.map((level) => (
        <Heading key={level} level={level}>
          h{level} — default variant
        </Heading>
      ))}
    </div>
  ),
};

export const TitleSizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {TITLE_SIZES.map((variant) => (
        <Heading key={variant} level={2} variant={variant}>
          title/{variant}
        </Heading>
      ))}
    </div>
  ),
};
