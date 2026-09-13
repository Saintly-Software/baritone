"use client";
import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import * as React from "react";
import { textIntentRecipe, textSizeRecipe } from "../../styles/recipes/text.css";
import { cx } from "../../utils/cx";
import { fieldsetLegend, fieldsetLegendDisabled, fieldsetRoot } from "./fieldset.css";

const legendClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "high" }),
  textSizeRecipe({ size: "sm" }),
);

const FieldDisabledContext = React.createContext<boolean>(false);

export function useIsFieldDisabled(): boolean {
  return React.useContext(FieldDisabledContext);
}

export interface FieldsetProps extends Omit<React.HTMLAttributes<HTMLFieldSetElement>, "color"> {
  children?: React.ReactNode;

  disabled?: boolean;

  className?: string;
}

export function Fieldset({ children, disabled = false, className, ...rest }: FieldsetProps) {
  const inheritedDisabled = useIsFieldDisabled();
  const groupDisabled = disabled || inheritedDisabled;

  return (
    <BaseFieldset.Root
      className={cx(fieldsetRoot, className)}
      data-disabled={groupDisabled || undefined}
      {...rest}
    >
      <FieldDisabledContext.Provider value={groupDisabled}>
        {children}
      </FieldDisabledContext.Provider>
    </BaseFieldset.Root>
  );
}

export interface FieldsetLegendProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  children?: React.ReactNode;

  className?: string;
}

export function FieldsetLegend({ children, className, ...rest }: FieldsetLegendProps) {
  const disabled = useIsFieldDisabled();
  return (
    <BaseFieldset.Legend
      className={cx(legendClass, fieldsetLegend, disabled && fieldsetLegendDisabled, className)}
      {...rest}
    >
      {children}
    </BaseFieldset.Legend>
  );
}
