"use client";
import * as React from "react";
import { textIntentRecipe, textVariantRecipe } from "../../styles/recipes/text.css";
import type { BodySize, Intent, Saliency } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";

export interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  /** Body typography variant. Default `base`. */
  variant?: BodySize;
  /** Override the inherited colour with this intent (resolves saliency to `mid`). */
  intent?: Intent;
  /** Override the inherited colour at this saliency. Falls back to `mid` when standalone. */
  saliency?: Saliency;
  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

/**
 * Text — body copy. Renders a `body` typography variant. By default its colour is
 * inherited from the ambient `--textColor` published by a surrounding `surface`/
 * `component` (falling back to the neutral/mid token when standalone), so text in
 * a coloured surface matches automatically; pass `intent` and/or `saliency` to
 * override. It also exposes its resolved colour to descendant `Icon`s via
 * `--iconColor`, so inline icons match the text.
 */
export function Text({
  variant = "base",
  intent,
  saliency,
  render,
  className,
  children,
  ref,
  ...rest
}: TextProps) {
  return useRender({
    render,
    defaultElement: "span",
    props: {
      ref,
      className: cx(
        textIntentRecipe({ intent, saliency }),
        textVariantRecipe({ family: "body", size: variant }),
        className,
      ),
      children,
      ...rest,
    },
  });
}
