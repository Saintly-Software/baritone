"use client";
import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import * as React from "react";
import { textIntentRecipe, textVariantRecipe } from "../../styles/recipes/text.css";
import { cx } from "../../utils/cx";
import { fieldsetLegend, fieldsetLegendDisabled, fieldsetRoot } from "./fieldset.css";

const legendClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "high" }),
  textVariantRecipe({ family: "body", size: "sm" }),
);

/**
 * Carries the fieldset's disabled state down to nested controls. Defaults to
 * `false` so a control outside any `Fieldset` reads "not inherited-disabled".
 * The value a `Fieldset` publishes is *cumulative* — a disabled ancestor keeps
 * its descendants disabled even inside an inner, not-explicitly-disabled
 * `Fieldset` (see `Fieldset` below).
 */
const FieldDisabledContext = React.createContext<boolean>(false);

/**
 * Read the disabled state inherited from an enclosing `Fieldset`. Form controls
 * OR this into their own `disabled` prop so a control is disabled when *either*
 * it or a wrapping fieldset is disabled:
 *
 * ```tsx
 * const inheritedDisabled = useIsFieldDisabled();
 * const disabled = ownDisabled || inheritedDisabled;
 * ```
 *
 * Returns `false` when there is no enclosing `Fieldset`.
 */
export function useIsFieldDisabled(): boolean {
  return React.useContext(FieldDisabledContext);
}

export interface FieldsetProps extends Omit<React.HTMLAttributes<HTMLFieldSetElement>, "color"> {
  /** The legend and the grouped controls. Usually a `FieldsetLegend` plus fields. */
  children?: React.ReactNode;
  /**
   * Disable the whole group. Propagates to every descendant control that reads
   * `useIsFieldDisabled()` (they set `aria-disabled` + stay focusable) — it is
   * *not* the native `<fieldset disabled>` attribute, which would drop the
   * controls from the tab order. Nested fieldsets are cumulative: a disabled
   * outer fieldset keeps its inner controls disabled regardless of the inner
   * fieldset's own `disabled`.
   */
  disabled?: boolean;
  /** Extra className merged onto the `<fieldset>`. */
  className?: string;
}

/**
 * Fieldset — groups related controls under a shared legend and an optional
 * shared disabled context. Built on base-ui's `Fieldset` (which renders a real
 * `<fieldset>` and wires the legend as the group's accessible name), so
 * screen-reader users hear the legend prefixed to each control inside.
 *
 * `disabled` fans out to every nested control through React context rather than
 * the native `<fieldset disabled>` attribute: the native attribute yanks the
 * controls out of the tab order, but our convention keeps disabled controls
 * focusable (so they can explain themselves). Controls opt in by reading
 * `useIsFieldDisabled()` and OR-ing it with their own `disabled` — every form
 * control in this package already does. Nesting composes: an inner fieldset can
 * add to, but never undo, an outer fieldset's disabled state.
 *
 * Label the group with a `FieldsetLegend` child, or point at an existing element
 * with `aria-labelledby`.
 *
 * @example
 * <Fieldset disabled={!editing}>
 *   <FieldsetLegend>Shipping address</FieldsetLegend>
 *   <TextInput label="Street" value={street} onChange={setStreet} />
 *   <TextInput label="City" value={city} onChange={setCity} />
 * </Fieldset>
 */
export function Fieldset({ children, disabled = false, className, ...rest }: FieldsetProps) {
  // Compose with any ancestor fieldset: an outer disabled fieldset stays disabled
  // for inner controls even if the inner fieldset isn't itself disabled.
  const inheritedDisabled = useIsFieldDisabled();
  const groupDisabled = disabled || inheritedDisabled;

  return (
    // No `disabled` on base-ui's `Fieldset.Root`: it would set the native
    // `<fieldset disabled>` attribute, dropping every nested control out of the
    // tab order. Disabled is published through `FieldDisabledContext` instead, and
    // each control models it the focusable way (`aria-disabled` + `readOnly`).
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
