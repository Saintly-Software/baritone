import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Text } from './index';

describe('Text', () => {
  it('renders body text in a span by default', () => {
    render(<Text>Hello</Text>);
    expect(screen.getByText('Hello').tagName).toBe('SPAN');
  });

  it('can render as a paragraph via the render prop', () => {
    render(<Text render={<p />}>Para</Text>);
    expect(screen.getByText('Para').tagName).toBe('P');
  });

  it('applies a generated recipe class', () => {
    render(<Text>Styled</Text>);
    expect(screen.getByText('Styled').className.length).toBeGreaterThan(0);
  });
});
