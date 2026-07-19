"use client";
import * as React from "react";
import {
  textIntentRecipe,
  textTypographyRecipe,
  type TextTypographyVariants,
  textVariantRecipe,
} from "../../styles/recipes/text.css";
import { atoms } from "../../styles/sprinkles.css";
import type { MarginProps, PaddingProps } from "../../styles/spacingProps";
import {
  HEADING_LEVEL_VARIANT,
  TITLE_SIZES,
  type HeadingLevel,
  type Intent,
  type Saliency,
  type TextSize,
} from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";

export interface HeadingProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">, MarginProps, PaddingProps {
  /** Semantic document level `1`–`6` (drives the rendered `h1`–`h6` tag). Required. */
  level: HeadingLevel;
  /**
   * Visual typography variant (size) override. Defaults to the title size mapped
   * from `level`, so an `<h2>` can be made to look like any size. Accepts the full
   * shared scale — title sizes render with title styling, the body-only `xs`
   * renders as body.
   */
  variant?: TextSize;
  intent?: Intent;
  /** Default `high` (headings are high saliency). */
  saliency?: Saliency;
  /** Font weight, from the `text.weight` tokens. Overrides the `variant`'s own weight. */
  weight?: TextTypographyVariants["weight"];
  /** Render the heading in italics. */
  italic?: TextTypographyVariants["italic"];
  /** Render the heading in the monospace font family. */
  mono?: TextTypographyVariants["mono"];
  /** Horizontal text alignment. */
  align?: TextTypographyVariants["align"];
  /** Whether the heading wraps onto multiple lines. */
  wrap?: TextTypographyVariants["wrap"];
  /** How the heading breaks long words. */
  wordBreak?: TextTypographyVariants["wordBreak"];
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLHeadingElement>;
  children?: React.ReactNode;
}

/**
 * Heading — titles. Takes a required semantic `level` (`1`–`6`, rendered as the
 * matching `h1`–`h6`) for the document outline and an optional visual `variant`
 * override. Defaults to high saliency. Shares `Text`'s token-backed typographic
 * knobs: `weight`, `italic`, `mono`, `align`, `wrap`, and `wordBreak`.
 */
export function Heading({
  level,
  variant,
  intent,
  saliency = "high",
  weight,
  italic,
  mono,
  align,
  wrap,
  wordBreak,
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
  // Title sizes render with the title family; the body-only `xs` borrows body
  // styling so an occasional tiny heading matches body copy.
  const family = (TITLE_SIZES as readonly string[]).includes(visual) ? "title" : "body";
  return useRender({
    render,
    defaultElement: `h${level}`,
    props: {
      ref,
      className: cx(
        textIntentRecipe({ intent, saliency }),
        textVariantRecipe({ family, size: visual }),
        textTypographyRecipe({ weight, italic, mono, align, wrap, wordBreak }),
        atoms({ m, mx, my, mt, mr, mb, ml, p, px, py, pt, pr, pb, pl }),
        className,
      ),
      children,
      ...rest,
    },
  });
}
