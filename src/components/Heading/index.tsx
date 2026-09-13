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
  level: HeadingLevel;

  size?: FontSizeName;
  intent?: Intent;

  saliency?: Saliency;

  weight?: FontWeightName;

  italic?: TypographyDecorationVariants["italic"];

  font?: FontName;

  render?: RenderProp;
  ref?: React.Ref<HTMLHeadingElement>;
  children?: React.ReactNode;
}

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
