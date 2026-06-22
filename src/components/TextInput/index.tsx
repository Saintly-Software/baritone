'use client';
import { Field } from '@base-ui-components/react/field';
import * as React from 'react';
import { formControlRecipe } from '../../styles/recipes/formControl.css';
import { textRecipe } from '../../styles/recipes/text.css';
import { atoms } from '../../styles/sprinkles.css';
import type { FormState, Size } from '../../theme/constants';
import { cx } from '../../utils/cx';

const wrapperClass = atoms({ display: 'flex', flexDirection: 'column', gap: '1' });
const labelClass = textRecipe({
  family: 'body',
  size: 'sm',
  intent: 'neutral',
  saliency: 'high',
});
const descriptionClass = textRecipe({
  family: 'body',
  size: 'xs',
  intent: 'neutral',
  saliency: 'low',
});
const errorClass = textRecipe({
  family: 'body',
  size: 'xs',
  intent: 'negative',
  saliency: 'high',
});

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Validation state. `invalid` maps to negative, `valid` to positive. */
  state?: FormState;
  /** Control size. Default `md`. */
  size?: Size;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Shown (and announced) when `state` is `invalid`. */
  errorMessage?: React.ReactNode;
  /** Uses `aria-disabled` + `readOnly` (keeps the field keyboard-focusable). */
  disabled?: boolean;
}

/**
 * TextInput — a "form control" element type built on base-ui's `Field` for label
 * association and ARIA wiring. Takes a `state` instead of intent/saliency.
 * Disabled uses `aria-disabled` so the field stays focusable (e.g. to surface an
 * explanatory tooltip), consistent with the rest of the system.
 */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    {
      state = 'neutral',
      size = 'md',
      label,
      description,
      errorMessage,
      disabled,
      readOnly,
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <Field.Root className={wrapperClass} invalid={state === 'invalid'}>
        {label != null && (
          <Field.Label className={labelClass}>{label}</Field.Label>
        )}
        <Field.Control
          ref={ref}
          className={cx(formControlRecipe({ state, size }), className)}
          aria-disabled={disabled || undefined}
          readOnly={disabled || readOnly}
          {...rest}
        />
        {description != null && (
          <Field.Description className={descriptionClass}>
            {description}
          </Field.Description>
        )}
        {state === 'invalid' && errorMessage != null && (
          <Field.Error className={errorClass} match>
            {errorMessage}
          </Field.Error>
        )}
      </Field.Root>
    );
  },
);
