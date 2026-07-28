"use client";
import * as React from "react";
import {
  textIntentRecipe,
  textSizeRecipe,
  typographyDecoration,
  type TypographyDecorationVariants,
  typographyFont,
  typographyWeight,
  type TypographyWeightVariants,
} from "../../../styles/recipes/text.css";
import { atoms } from "../../../styles/sprinkles.css";
import type { MarginProps, PaddingProps, TypographyAtomProps } from "../../../styles/spacingProps";
import type { Intent, Saliency, TextSize } from "../../../theme/constants";
import { cx } from "../../../utils/cx";
import { useRender, type RenderProp } from "../../../utils/render";

/**
 * `InternalText` — the shared typography primitive behind `Text` and `Heading`.
 * It owns the whole class composition — colour (`textIntentRecipe`), size +
 * line-height (`textSizeRecipe`), the optional typographic recipes
 * (`typographyWeight` / `typographyDecoration` / `typographyFont`), and the
 * text-layout + spacing atoms — plus the base-ui `render` polymorphism. The two
 * public components differ only in the values they feed in (default element,
 * default `size`/`weight`/`saliency`, and their semantic tag), so they resolve
 * those and delegate here.
 */
export interface InternalTextProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, "color">,
    MarginProps,
    PaddingProps,
    TypographyAtomProps {
  /** Typography size — drives both font-size and line-height. */
  size: TextSize;
  /** Override the inherited colour with this intent (resolves saliency to `mid`). */
  intent?: Intent;
  /** Override the inherited colour at this saliency. Falls back to `mid` when standalone. */
  saliency?: Saliency;
  /** Font weight, from the `text.weight` tokens. Overrides the size's default weight. */
  weight?: TypographyWeightVariants["weight"];
  /** Render the text in italics. */
  italic?: TypographyDecorationVariants["italic"];
  /** Render the text in the monospace font family. */
  mono?: boolean;
  /** The tag rendered when `render` isn't supplied. */
  defaultElement: keyof React.JSX.IntrinsicElements;
  /** base-ui `render` escape hatch (any element/component). */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

export function InternalText({
  size,
  intent,
  saliency,
  weight,
  italic,
  mono,
  textAlign,
  whiteSpace,
  overflowWrap,
  textTransform,
  defaultElement,
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
}: InternalTextProps) {
  return useRender({
    render,
    defaultElement,
    props: {
      ref,
      className: cx(
        textIntentRecipe({ intent, saliency }),
        textSizeRecipe({ size }),
        typographyWeight({ weight }),
        typographyDecoration({ italic }),
        typographyFont({ font: mono ? "mono" : undefined }),
        atoms({
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
          textAlign,
          whiteSpace,
          overflowWrap,
          textTransform,
        }),
        className,
      ),
      children,
      ...rest,
    },
  });
}
