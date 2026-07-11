"use client";
import * as React from "react";
import {
  textIntentRecipe,
  textStyleRecipe,
  textVariantRecipe,
} from "../../styles/recipes/text.css";
import { atoms } from "../../styles/sprinkles.css";
import type { MarginProps, PaddingProps } from "../../styles/spacingProps";
import {
  HEADING_LEVEL_VARIANT,
  type FontWeight,
  type HeadingLevel,
  type Intent,
  type Saliency,
  type TextAlign,
  type TextWrap,
  type TitleSize,
} from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";

export interface HeadingProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">, MarginProps, PaddingProps {
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
  /** Logical text alignment. Inherits when omitted. */
  align?: TextAlign;
  /** Override the variant's default font weight with a named token. */
  weight?: FontWeight;
  /** `text-wrap` behaviour (e.g. `balance` for tidy multi-line titles). */
  wrap?: TextWrap;
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
  saliency = "high",
  align,
  weight,
  wrap,
  render,
  className,
  children,
  ref,
  m,
  mx,
  my,
  mt,
  mr,
  mb,
  ml,
  p,
  px,
  py,
  pt,
  pr,
  pb,
  pl,
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
        textVariantRecipe({ family: "title", size: visual }),
        textStyleRecipe({ align, weight, wrap }),
        atoms({ m, mx, my, mt, mr, mb, ml, p, px, py, pt, pr, pb, pl }),
        className,
      ),
      children,
      ...rest,
    },
  });
}
