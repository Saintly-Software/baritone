'use client';
import * as React from 'react';
import { surfaceRecipe } from '../../styles/recipes/surface.css';
import type { Intent, SurfaceSaliency } from '../../theme/constants';
import { cx } from '../../utils/cx';
import { useRender, type RenderProp } from '../../utils/render';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Default `neutral` (most surfaces are neutral). */
  intent?: Intent;
  /** `low` (default neutral surface) or `high` (washed). Default `low`. */
  saliency?: SurfaceSaliency;
  /** Internal padding from the spacing scale. Default `md`. */
  padding?: CardPadding;
  /** Uses `aria-disabled` rather than `disabled`. */
  disabled?: boolean;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  children?: React.ReactNode;
}

/**
 * Card — a "surface" element type. Two saliency levels (low/high). Supports the
 * neutral intent by default; other intents exist for surfaces like Notice.
 */
export const Card = React.forwardRef<HTMLElement, CardProps>(function Card(
  { intent, saliency, padding, disabled, render, className, children, ...rest },
  ref,
) {
  return useRender({
    render,
    defaultElement: 'div',
    props: {
      ref,
      className: cx(surfaceRecipe({ intent, saliency, padding }), className),
      'aria-disabled': disabled || undefined,
      children,
      ...rest,
    },
  });
});
