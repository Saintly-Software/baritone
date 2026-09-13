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

/**
 * Carries the fieldset's disabled state down to nested controls, cumulatively —
 * a disabled ancestor keeps its descendants disabled even inside an inner,
 * not-explicitly-disabled `Fieldset`. Defaults to `false`.
 */
const FieldDisabledContext = React.createContext<boolean>(false);

/**
 * Read the disabled state inherited from an enclosing `Fieldset`. Form controls
 * OR this into their own `disabled` prop. Returns `false` with no enclosing
 * `Fieldset`.
 */
export function useIsFieldDisabled(): boolean {
  return React.useContext(FieldDisabledContext);
}

export interface FieldsetProps extends Omit<React.HTMLAttributes<HTMLFieldSetElement>, "color"> {
  /** The legend and the grouped controls. Usually a `FieldsetLegend` plus fields. */
  children?: React.ReactNode;
  /**
   * Disable the whole group. Propagates through context to every descendant
   * control (which stay focusable via `aria-disabled`), not the native
   * `<fieldset disabled>` attribute. Cumulative across nesting.
   */
  disabled?: boolean;
  /** Extra className merged onto the `<fieldset>`. */
  className?: string;
}

/**
 * Groups related controls under a shared legend and an optional shared disabled
 * context. Built on base-ui's `Fieldset`, so screen-reader users hear the legend
 * prefixed to each control. `disabled` fans out through context (keeping controls
 * focusable) rather than the native `<fieldset disabled>` attribute; nesting is
 * cumulative. Label the group with a `FieldsetLegend` child or `aria-labelledby`.
 *
 * @example
 * <Fieldset disabled={!editing}>
 *   <FieldsetLegend>Shipping address</FieldsetLegend>
 *   <TextInput label="Street" value={street} onChange={setStreet} />
 *   <TextInput label="City" value={city} onChange={setCity} />
 * </Fieldset>
 */
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
  /** The legend text. */
  children?: React.ReactNode;
  /** Extra className merged onto the legend. */
  className?: string;
}

/**
 * FieldsetLegend — the visible heading for a `Fieldset`, automatically wired as
 * the group's accessible name by base-ui. Styled like the form-group labels
 * (neutral-high body text) and dimmed when the enclosing `Fieldset` is disabled.
 */
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
