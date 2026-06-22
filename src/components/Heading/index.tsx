'use client';
import * as React from 'react';
import { textRecipe } from '../../styles/recipes/text.css';
import {
  HEADING_LEVEL_VARIANT,
  type HeadingLevel,
  type Intent,
  type Saliency,
  type TitleSize,
} from '../../theme/constants';
import { cx } from '../../utils/cx';
import { useRender, type RenderProp } from '../../utils/render';

export interface HeadingProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'> {
  /** Semantic document level (drives the rendered tag). Default `h2`. */
  level?: HeadingLevel;
  /**
   * Visual `title` variant override. Defaults to the variant mapped from
   * `level`, so an `<h2>` can be made to look like any title size.
   */
  variant?: TitleSize;
  intent?: Intent;
  /** Default `high` (headings are high saliency). */
  saliency?: Saliency;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  children?: React.ReactNode;
}

/**
 * Heading — titles. Takes a semantic `level` (h1–h6) for the document outline
 * and an optional visual `variant` override. Defaults to high saliency.
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  function Heading(
    { level = 'h2', variant, intent, saliency = 'high', render, className, children, ...rest },
    ref,
  ) {
    const visual = variant ?? HEADING_LEVEL_VARIANT[level];
    return useRender({
      render,
      defaultElement: level,
      props: {
        ref,
        className: cx(
          textRecipe({ family: 'title', size: visual, intent, saliency }),
          className,
        ),
        children,
        ...rest,
      },
    });
  },
);
