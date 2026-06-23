'use client';
import { Field } from '@base-ui/react/field';
import * as React from 'react';
import { focusRingRecipe } from '../../styles/recipes/focusRing.css';
import { formControlRecipe } from '../../styles/recipes/formControl.css';
import {
  textIntentRecipe,
  textVariantRecipe,
} from '../../styles/recipes/text.css';
import { atoms } from '../../styles/sprinkles.css';
import type { FormState, Size } from '../../theme/constants';
import { cx } from '../../utils/cx';

const wrapperClass = atoms({ display: 'flex', flexDirection: 'column', gap: '1' });
const labelClass = cx(
  textIntentRecipe({ intent: 'neutral', saliency: 'high' }),
  textVariantRecipe({ family: 'body', size: 'sm' }),
);
const descriptionClass = cx(
  textIntentRecipe({ intent: 'neutral', saliency: 'low' }),
  textVariantRecipe({ family: 'body', size: 'xs' }),
);
const errorClass = cx(
  textIntentRecipe({ intent: 'negative', saliency: 'high' }),
  textVariantRecipe({ family: 'body', size: 'xs' }),
);

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
  ref?: React.Ref<HTMLInputElement>;
}

/**
 * TextInput — a "form control" element type built on base-ui's `Field` for label
 * association and ARIA wiring. Takes a `state` instead of intent/saliency.
 * Disabled uses `aria-disabled` so the field stays focusable (e.g. to surface an
 * explanatory tooltip), consistent with the rest of the system.
 */
export function TextInput({
  state = 'neutral',
  size = 'md',
  label,
  description,
  errorMessage,
  disabled,
  readOnly,
  className,
  ref,
  ...rest
}: TextInputProps) {
  return (
    <Field.Root className={wrapperClass} invalid={state === 'invalid'}>
      {label != null && (
        <Field.Label className={labelClass}>{label}</Field.Label>
      )}
      <Field.Control
        ref={ref}
        className={cx(
          formControlRecipe({ state, size }),
          focusRingRecipe({ type: 'visible', offset: 'sm' }),
          className,
        )}
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
}
