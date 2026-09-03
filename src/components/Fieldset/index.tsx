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
 * Carries the fieldset's disabled state down to nested controls. Defaults to
 * `false` outside any `Fieldset`. The published value is *cumulative* — a
 * disabled ancestor keeps descendants disabled even inside an inner,
 * not-explicitly-disabled `Fieldset` (see `Fieldset` below).
 */
const FieldDisabledContext = React.createContext<boolean>(false);

/**
 * Read the disabled state inherited from an enclosing `Fieldset`. Form controls
 * OR this into their own `disabled` prop so either can disable the control:
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
   * `useIsFieldDisabled()` (they set `aria-disabled` and stay focusable) — not
   * the native `<fieldset disabled>` attribute, which would drop controls from
   * the tab order. Nested fieldsets are cumulative: a disabled outer fieldset
   * keeps inner controls disabled regardless of the inner fieldset's own value.
   */
  disabled?: boolean;
  /** Extra className merged onto the `<fieldset>`. */
  className?: string;
}

/**
 * Fieldset — groups related controls under a shared legend and an optional
 * shared disabled context. Built on base-ui's `Fieldset`, which renders a real
 * `<fieldset>` and wires the legend as the group's accessible name.
 *
 * `disabled` fans out to nested controls through React context rather than the
 * native `<fieldset disabled>` attribute, which would drop controls from the
 * tab order — our convention keeps them focusable so they can explain
 * themselves. Controls opt in via `useIsFieldDisabled()`, OR'd with their own
 * `disabled`. Nesting composes: an inner fieldset can add to, but never undo,
 * an outer fieldset's disabled state.
 *
 * Label the group with a `FieldsetLegend` child, or `aria-labelledby`.
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
    // No `disabled` on base-ui's `Fieldset.Root` — it would set the native
    // attribute, dropping nested controls from the tab order. Published via
    // `FieldDisabledContext` instead; controls model it with `aria-disabled` + `readOnly`.
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
 * FieldsetLegend — the visible heading for a `Fieldset`, wired by base-ui as its
 * accessible name. Styled like form-group labels, dimmed when disabled.
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
