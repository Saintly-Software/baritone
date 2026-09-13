"use client";
import { cx } from "../../../utils/cx";
import { internalSpinnerRecipe, type InternalSpinnerRecipeVariants } from "./internalSpinner.css";

export interface InternalSpinnerProps {
  size?: InternalSpinnerRecipeVariants["size"];

  className?: string;
}

export function InternalSpinner({ size, className }: InternalSpinnerProps) {
  return <span className={cx(internalSpinnerRecipe({ size }), className)} aria-hidden />;
}
