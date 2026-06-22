import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TextInput } from './index';

describe('TextInput', () => {
  it('associates its label with the input', () => {
    render(<TextInput label="Email" placeholder="you@example.com" />);
    const input = screen.getByLabelText('Email');
    expect(input.tagName).toBe('INPUT');
  });

  it('uses aria-disabled + readOnly rather than the disabled attribute', () => {
    render(<TextInput label="Name" disabled />);
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('aria-disabled', 'true');
    expect(input).toHaveAttribute('readonly');
    expect(input).not.toBeDisabled();
  });

  it('shows the error message and marks the field invalid in the invalid state', () => {
    render(
      <TextInput label="Age" state="invalid" errorMessage="Must be a number" />,
    );
    expect(screen.getByText('Must be a number')).toBeInTheDocument();
    expect(screen.getByLabelText('Age')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not render an error message outside the invalid state', () => {
    render(
      <TextInput label="Age" state="warning" errorMessage="Hidden" />,
    );
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });
});
