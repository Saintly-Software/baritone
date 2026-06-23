'use client';
import * as React from 'react';
import {
  textIntentRecipe,
  textVariantRecipe,
} from '../../styles/recipes/text.css';
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
  /** Semantic document level `1`–`6` (drives the rendered `h1`–`h6` tag). Required. */
  level: HeadingLevel;
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
  ref?: React.Ref<HTMLHeadingElement>;
  children?: React.ReactNode;
}

/**
 * Heading — titles. Takes a required semantic `level` (`1`–`6`, rendered as the
 * matching `h1`–`h6`) for the document outline and an optional visual `variant`
 * override. Defaults to high saliency.
 */
export function Heading({
  level,
  variant,
  intent,
  saliency = 'high',
  render,
  className,
  children,
  ref,
  ...rest
}: HeadingProps) {
  const visual = variant ?? HEADING_LEVEL_VARIANT[level];
  return useRender({
    render,
    defaultElement: `h${level}`,
    props: {
      ref,
      className: cx(
        textIntentRecipe({ intent, saliency }),
        textVariantRecipe({ family: 'title', size: visual }),
        className,
      ),
      children,
      ...rest,
    },
  });
}
