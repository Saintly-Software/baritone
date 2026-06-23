import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Heading } from './index';

describe('Heading', () => {
  it('renders the numeric semantic level as the matching h-tag', () => {
    render(<Heading level={2}>Title</Heading>);
    const heading = screen.getByRole('heading', { level: 2, name: 'Title' });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2');
  });

  it('renders the requested semantic level', () => {
    render(<Heading level={1}>Big</Heading>);
    expect(screen.getByRole('heading', { level: 1, name: 'Big' })).toBeInTheDocument();
  });

  it('allows a visual variant independent of the semantic level', () => {
    render(
      <Heading level={3} variant="4xl">
        Small tag, big look
      </Heading>,
    );
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });
});
