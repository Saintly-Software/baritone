import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './index';

describe('Card', () => {
  it('renders a div with its children by default', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Content');
    expect(card.tagName).toBe('DIV');
  });

  it('sets aria-disabled when disabled', () => {
    render(<Card disabled>Locked</Card>);
    expect(screen.getByText('Locked')).toHaveAttribute('aria-disabled', 'true');
  });

  it('can render as another element via the render prop', () => {
    render(
      <Card render={<section aria-label="panel" />}>
        <span>Inner</span>
      </Card>,
    );
    const section = screen.getByLabelText('panel');
    expect(section.tagName).toBe('SECTION');
    expect(section).toContainElement(screen.getByText('Inner'));
  });
});
