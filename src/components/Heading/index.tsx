"use client";
import * as React from "react";
import { InternalText } from "../../internal/components/InternalText";
import type {
  TypographyDecorationVariants,
  TypographyWeightVariants,
} from "../../styles/recipes/text.css";
import type { MarginProps, PaddingProps, TypographyAtomProps } from "../../styles/spacingProps";
import {
  HEADING_LEVEL_SIZE,
  HEADING_LEVEL_WEIGHT,
  type HeadingLevel,
  type Intent,
  type Saliency,
  type TextSize,
} from "../../theme/constants";
import type { FontName } from "../../theme/fonts";
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
   * Visual size override. Defaults to the size mapped from `level`, so an `<h2>`
   * can be made to look like any size. Accepts the full shared scale (`xs`–`9xl`).
   */
  size?: TextSize;
  intent?: Intent;
  /** Default `high` (headings are high saliency). */
  saliency?: Saliency;
  /** Font weight, from the `text.weight` tokens. Defaults to the level's customary weight. */
  weight?: TypographyWeightVariants["weight"];
  /** Render the heading in italics. */
  italic?: TypographyDecorationVariants["italic"];
  /**
   * Font family, by name. `sans` (default) and `mono` are always available; other
   * names are consumer-defined via the theme's `fonts` option + `FontRegistry`.
   * See {@link FontName}.
   */
  font?: FontName;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLHeadingElement>;
  children?: React.ReactNode;
}

/**
 * Heading — titles. Takes a required semantic `level` (`1`–`6`, rendered as the
 * matching `h1`–`h6`) for the document outline and an optional visual `size`
 * override. Defaults to high saliency and, per level, a customary bold/semibold
 * `weight` (weight is otherwise independent of `size`). Shares `Text`'s
 * token-backed typographic knobs (`weight`, `italic`, `font`) and the
 * `textAlign` / `whiteSpace` / `overflowWrap` / `textTransform` layout atoms.
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
