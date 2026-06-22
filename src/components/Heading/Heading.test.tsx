import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Heading } from './index';

describe('Heading', () => {
  it('defaults to an h2', () => {
    render(<Heading>Title</Heading>);
    expect(screen.getByRole('heading', { level: 2, name: 'Title' })).toBeInTheDocument();
  });

  it('renders the requested semantic level', () => {
    render(<Heading level="h1">Big</Heading>);
    expect(screen.getByRole('heading', { level: 1, name: 'Big' })).toBeInTheDocument();
  });

  it('allows a visual variant independent of the semantic level', () => {
    render(
      <Heading level="h3" variant="4xl">
        Small tag, big look
      </Heading>,
    );
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });
});
