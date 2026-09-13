"use client";
import * as React from "react";
import { InternalSpinner } from "../../internal/components/InternalSpinner";
import type { InternalSpinnerRecipeVariants } from "../../internal/components/InternalSpinner/internalSpinner.css";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";
import { SrOnly } from "../SrOnly";
import { loadingIndicatorRecipe } from "./loadingIndicator.css";

const RING_SIZE: Record<Size, InternalSpinnerRecipeVariants["size"]> = {
  sm: "sm",
  md: "sm",
  lg: "lg",
};

export interface LoadingIndicatorProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "color"
> {
  size?: Size;

  variant?: "spinner";

  intent?: Intent;

  saliency?: Saliency;

  label?: string;

  render?: RenderProp;
  ref?: React.Ref<HTMLSpanElement>;
}

export function LoadingIndicator({
  size = "md",
  variant = "spinner",
  intent,
  saliency,
  label = "Loading",
  render,
  className,
  ref,
  ...rest
}: LoadingIndicatorProps) {
  void variant;

  const decorative = rest["aria-hidden"] === true || rest["aria-hidden"] === "true";

  return useRender({
    render,
    defaultElement: "span",
    props: {
      ref,
      className: cx(loadingIndicatorRecipe({ intent, saliency, size }), className),
      role: decorative ? undefined : "status",
      children: (
        <>
          <InternalSpinner size={RING_SIZE[size]} />
          {decorative ? null : <SrOnly>{label}</SrOnly>}
        </>
      ),
      ...rest,
    },
  });
}

LoadingIndicator.displayName = "LoadingIndicator";
