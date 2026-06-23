'use client';
import * as React from 'react';
import {
  componentIntentRecipe,
  componentTypographyRecipe,
} from '../../styles/recipes/component.css';
import { focusRingRecipe } from '../../styles/recipes/focusRing.css';
import type { Intent, Saliency, Size } from '../../theme/constants';
import { cx } from '../../utils/cx';
import { useRender, type RenderProp } from '../../utils/render';

export interface ChipProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
  /** Uses `aria-disabled` (keyboard-focusable) rather than `disabled`. */
  disabled?: boolean;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

/**
 * Chip — a "component" element type. Shares the colour scheme/recipe with Button
 * et al., so `<Chip intent="negative" saliency="high">` matches a Button with
 * the same props. Hover/active states are derived from tokens at use-site.
 */
export function Chip({
  intent,
  saliency,
  size,
  disabled,
  render,
  className,
  children,
  ref,
  ...rest
}: ChipProps) {
  return useRender({
    render,
    defaultElement: 'span',
    props: {
      ref,
      className: cx(
        componentTypographyRecipe({ size }),
        componentIntentRecipe({ intent, saliency }),
        focusRingRecipe({ type: 'visible' }),
        className,
      ),
      'aria-disabled': disabled || undefined,
      children,
      ...rest,
    },
  });
}
