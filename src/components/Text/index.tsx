"use client";
import * as React from "react";
import { InternalText } from "../../internal/components/InternalText";
import type { TypographyDecorationVariants } from "../../styles/recipes/text.css";
import type { MarginProps, PaddingProps, TypographyAtomProps } from "../../styles/spacingProps";
import type { Intent, Saliency } from "../../theme/constants";
import type { FontSizeName } from "../../theme/fontSizes";
import type { FontName } from "../../theme/fonts";
import type { FontWeightName } from "../../theme/fontWeights";
import type { RenderProp } from "../../utils/render";

export type TextElement = "div" | "p" | "label" | "span";

interface TextOwnProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, "color">,
    MarginProps,
    PaddingProps,
    TypographyAtomProps {
  size?: FontSizeName;

  intent?: Intent;

  saliency?: Saliency;

  weight?: FontWeightName;

  italic?: TypographyDecorationVariants["italic"];

  font?: FontName;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

export type TextProps = TextOwnProps &
  (
    | {
        as?: TextElement;
        render?: never;
      }
    | {
        as?: never;

        render?: RenderProp;
      }
  );

export function Text(props: TextProps) {
  const {
    as,
    render,
    size = "md",
    ...rest
  } = props as TextOwnProps & {
    as?: TextElement;
    render?: RenderProp;
  };

  return <InternalText {...rest} size={size} render={render} defaultElement={as ?? "div"} />;
}
