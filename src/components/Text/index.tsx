'use client';
import * as React from 'react';
import { textRecipe } from '../../styles/recipes/text.css';
import type { BodySize, Intent, Saliency } from '../../theme/constants';
import { cx } from '../../utils/cx';
import { useRender, type RenderProp } from '../../utils/render';

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  /** Body typography variant. Default `base`. */
  variant?: BodySize;
  intent?: Intent;
  /** Default `mid` (the default for body text). */
  saliency?: Saliency;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  children?: React.ReactNode;
}

/**
 * Text — body copy. Renders a `body` typography variant and exposes its resolved
 * colour to descendant `Icon`s via `--iconColor`, so inline icons match the
 * text automatically. Defaults to mid saliency / neutral intent.
 */
export const Text = React.forwardRef<HTMLElement, TextProps>(function Text(
  { variant = 'base', intent, saliency, render, className, children, ...rest },
  ref,
) {
  return useRender({
    render,
    defaultElement: 'span',
    props: {
      ref,
      className: cx(
        textRecipe({ family: 'body', size: variant, intent, saliency }),
        className,
      ),
      children,
      ...rest,
    },
  });
});
