"use client";
import * as React from "react";
import { InternalText } from "../../internal/components/InternalText";
import type { TypographyDecorationVariants } from "../../styles/recipes/text.css";
import type { MarginProps, PaddingProps, TypographyAtomProps } from "../../styles/spacingProps";
import {
  HEADING_LEVEL_SIZE,
  HEADING_LEVEL_WEIGHT,
  type HeadingLevel,
  type Intent,
  type Saliency,
} from "../../theme/constants";
import type { FontSizeName } from "../../theme/fontSizes";
import type { FontName } from "../../theme/fonts";
import type { FontWeightName } from "../../theme/fontWeights";
import type { RenderProp } from "../../utils/render";

export interface HeadingProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, "color">,
    MarginProps,
    PaddingProps,
    TypographyAtomProps {
  /** Semantic document level `1`–`6` (drives the rendered `h1`–`h6` tag). Required. */
  level: HeadingLevel;
  /**
   * Visual size override, by name. Defaults to the size mapped from `level`, so
   * an `<h2>` can look like any size. Built-in scale `xs`–`9xl`; other names come
   * from the theme's `sizes` option + `FontSizeRegistry`. See {@link FontSizeName}.
   */
  size?: FontSizeName;
  intent?: Intent;
  /** Default `high` (headings are high saliency). */
  saliency?: Saliency;
  /**
   * Font weight, by name. Defaults to the level's customary weight. Built-in
   * steps (`default`/`semibold`/`bold`/`superbold`); other names come from the
   * theme's `weights` option + `FontWeightRegistry`. See {@link FontWeightName}.
   */
  weight?: FontWeightName;
  /** Render the heading in italics. */
  italic?: TypographyDecorationVariants["italic"];
  /**
   * Font family, by name. `sans` (default) and `mono` are always available;
   * other names come from the theme's `fonts` option + `FontRegistry`. See {@link FontName}.
   */
  font?: FontName;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLHeadingElement>;
  children?: React.ReactNode;
}

/**
 * Heading — titles. Takes a required semantic `level` (`1`–`6`, rendered as the
 * matching `h1`–`h6`) plus an optional visual `size` override. Defaults to high
 * saliency and a per-level bold/semibold `weight` (independent of `size`).
 * Shares `Text`'s typographic knobs and layout atoms (`italic`, `size`,
 * `weight`, `lineHeight`, `font`, `letterSpacing`, `textAlign`, `whiteSpace`,
 * `overflowWrap`, `textTransform`).
 */
export function Heading(props: HeadingProps) {
  const {
    level,
    render,
    ref,
    size = HEADING_LEVEL_SIZE[level],
    saliency = "high",
    weight = HEADING_LEVEL_WEIGHT[level],
    ...rest
  } = props;

  return (
    <InternalText
      {...rest}
      ref={ref as React.Ref<HTMLElement>}
      size={size}
      saliency={saliency}
      weight={weight}
      render={render}
      defaultElement={`h${level}`}
    />
  );
}
