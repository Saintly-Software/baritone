"use client";
import { Select as BaseSelect } from "@base-ui/react/select";
import * as React from "react";
import { InternalCheckbox } from "../../internal/components/InternalCheckbox";
import { InternalSpinner } from "../../internal/components/InternalSpinner";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { formControlRecipe } from "../../styles/recipes/formControl.css";
import { surfaceRecipe } from "../../styles/recipes/surface.css";
import type { FormState, LabelPosition, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import {
  Field,
  type FieldLabellingInput,
  type FieldLabellingProps,
  fieldNameAttrs,
  type FieldSlotProps,
} from "../Field";
import { useIsFieldDisabled } from "../Fieldset";
import {
  selectClearButton,
  selectClearSlot,
  selectEndAdornments,
  selectGroup,
  selectGroupLabel,
  selectIcon,
  selectItem,
  selectItemIndicator,
  selectItemText,
  selectList,
  selectPopup,
  selectSpinner,
  selectTrigger,
  selectTriggerRow,
  selectValue,
} from "./select.css";

/** One selectable option. */
export interface SelectOption {
  /** Visible text (also the trigger's rendered value when chosen). */
  label: string;
  /** The value committed to `onChange`. */
  value: string;
  /** Dim + skip this option. Modelled with `aria-disabled` (base-ui), not the
   * native attribute, so it stays in the listbox's accessibility tree. */
  disabled?: boolean;
}

/** A titled group of options, rendered under a heading in the popup. */
export interface SelectOptionGroup {
  /** The group heading, shown above the options and associated as their label. */
  label: string;
  /** The options within this group. */
  options: ReadonlyArray<SelectOption>;
}

/**
 * `options` accepts either a flat list or an array of `{ label, options }`
 * groups; this narrows which one you passed.
 */
function isGrouped(
  options: ReadonlyArray<SelectOption> | ReadonlyArray<SelectOptionGroup>,
): options is ReadonlyArray<SelectOptionGroup> {
  const first = options[0];
  return first != null && "options" in first;
}

/**
 * Props common to both the single- and multi-select variants. The
 * `value`/`onChange`/`multiple` triad is intentionally *not* here — it's split
 * across the discriminated union below so the shapes can't drift (single is one
 * `string | null`, multiple is a `string[]`).
 */
interface SelectBaseProps extends Omit<
  React.HTMLAttributes<HTMLButtonElement>,
  "color" | "defaultValue" | "value" | "onChange" | "aria-label" | "aria-labelledby"
> {
  /**
   * The options to choose from. Pass a flat `SelectOption[]`, or an array of
   * `{ label, options }` groups to render options under headings.
   */
  options: ReadonlyArray<SelectOption> | ReadonlyArray<SelectOptionGroup>;
  /** Supplementary text beneath the control, wired as its accessible description. */
  helpText?: React.ReactNode;
  /** Shown (and announced) when `state` is `invalid`. */
  errorMessage?: React.ReactNode;
  /** Validation state. `invalid` maps to negative, `valid` to positive. */
  state?: FormState;
  /** Where the label sits. `top` (default) stacks it above; `start`/`end` inline it. */
  labelPosition?: LabelPosition;
  /** Per-slot overrides for the label / help-text pieces. */
  slotProps?: FieldSlotProps;
  /** Control size. Default `md`. */
  size?: Size;
  /** Text shown on the trigger when nothing is selected. */
  placeholder?: string;
  /**
   * Dim + lock the control. Modelled with `aria-disabled` + base-ui's `readOnly`
   * (not the native `disabled` attribute), so the trigger stays keyboard-focusable
   * — e.g. it can still be tabbed to and explain itself — while choosing a
   * different option is vetoed.
   */
  disabled?: boolean;
  /** Mark the field as required (sets `aria-required`). */
  required?: boolean;
  /** Identifies the field when submitted as part of a form. */
  name?: string;
  /** Show a busy spinner in place of the chevron and veto interaction. */
  loading?: boolean;
  /** Hide the clear button even when there's a value to clear. */
  hideClearButton?: boolean;
  /** Extra className merged onto the trigger. */
  className?: string;
  /** Ref to the trigger `<button>`. */
  ref?: React.Ref<HTMLButtonElement>;
}

/** Single-select: one `string` value (or `null` when empty). */
export interface SingleSelectProps extends SelectBaseProps {
  multiple?: false;
  /** The selected value, or `null` when nothing is selected (controlled). */
  value: string | null;
  /** Called with the newly selected value (or `null` when cleared). */
  onChange: (value: string | null) => void;
}

/** Multi-select: an array of values. */
export interface MultipleSelectProps extends SelectBaseProps {
  multiple: true;
  /** The selected values (controlled). */
  value: string[];
  /** Called with the next selected-values array (after a toggle or clear). */
  onChange: (value: string[]) => void;
}

/**
 * Discriminated on `multiple`, so `value` and `onChange` stay in lockstep:
 * `multiple` ⇒ arrays, otherwise a lone `string | null`. TypeScript narrows both
 * from the single `multiple` flag, so a mismatched pair is a compile error.
 * Intersected with `FieldLabellingProps`, so exactly one of `label` /
 * `aria-label` / `aria-labelledby` may name the trigger.
 */
export type SelectProps = (SingleSelectProps | MultipleSelectProps) & FieldLabellingProps;

/** Decorative disclosure chevron; the trigger carries the a11y semantics. */
function ChevronGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/** Decorative clear glyph (✕); the clear button carries the a11y label. */
function ClearGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** Trailing check on the selected option (single-select). */
function CheckGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

/**
 * Select — a "form control" element type for picking from a list, built on
 * base-ui's `Select` (listbox semantics, keyboard navigation, typeahead, focus
 * management) and composing `Field` for the label / help / error layout and ARIA
 * wiring, like `TextInput` and `RadioGroup`. It takes a `state`, not
 * intent/saliency, and is named by exactly one of `label` / `aria-label` /
 * `aria-labelledby` (they're mutually exclusive — see `FieldLabellingProps`).
 *
 * It's discriminated on `multiple`: a single select commits one `string | null`;
 * a multi select commits a `string[]` and renders each option with a composed
 * `InternalCheckbox` reflecting whether it's chosen. Both offer a clear button
 * (suppress with `hideClearButton`).
 *
 * Disabled follows the system convention: `aria-disabled` + base-ui's `readOnly`
 * rather than the native `disabled` attribute, so the trigger stays focusable.
 *
 * @example
 * const [value, setValue] = React.useState<string | null>(null);
 * <Select
 *   label="Fruit"
 *   placeholder="Pick one"
 *   value={value}
 *   onChange={setValue}
 *   options={[
 *     { label: "Apple", value: "apple" },
 *     { label: "Banana", value: "banana" },
 *   ]}
 * />
 */
export function Select(props: SelectProps) {
  const {
    multiple = false,
    value,
    onChange,
    options,
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    helpText,
    errorMessage,
    state = "neutral",
    labelPosition = "top",
    slotProps,
    size = "md",
    placeholder,
    disabled: disabledProp = false,
    required = false,
    name,
    loading = false,
    hideClearButton = false,
    className,
    ref,
    ...rest
  } = props as SelectBaseProps &
    FieldLabellingInput & {
      multiple?: boolean;
      value: string | string[] | null;
      onChange: (value: never) => void;
    };

  // A wrapping `Fieldset` can disable the whole group; OR it into the local prop.
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;
  const nameProps: FieldLabellingInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  };

  // The union is collapsed to a single runtime handler; the casts are safe
  // because `multiple` decides which arm the caller wired.
  const emit = onChange as (value: string | string[] | null) => void;
  const handleValueChange = (next: string | string[] | null) => emit(next);
  const clear = () => emit(multiple ? [] : null);

  const hasValue = multiple ? (value as string[]).length > 0 : value != null;
  const showClear = !hideClearButton && hasValue && !disabled && !loading;
  // Disabled and loading both lock the value the focusable way: base-ui's
  // `readOnly` vetoes commits while `aria-disabled` carries the semantics.
  const locked = disabled || loading;

  // `options` may be flat or grouped. base-ui's `items` prop only needs the flat
  // set (it maps a value back to its label for the trigger), so flatten for that;
  // the grouped structure drives the rendered `Group`/`GroupLabel` sections.
  const flatOptions = isGrouped(options) ? options.flatMap((group) => group.options) : options;

  const renderItem = (option: SelectOption) => (
    <BaseSelect.Item
      key={option.value}
      value={option.value}
      disabled={option.disabled}
      className={selectItem({ size })}
    >
      {multiple && (
        <InternalCheckbox
          checked={(value as string[]).includes(option.value)}
          size={size}
          aria-hidden
        />
      )}
      <BaseSelect.ItemText className={selectItemText}>{option.label}</BaseSelect.ItemText>
      {!multiple && (
        <BaseSelect.ItemIndicator className={selectItemIndicator}>
          <CheckGlyph />
        </BaseSelect.ItemIndicator>
      )}
    </BaseSelect.Item>
  );

  return (
    <Field
      {...(nameProps as FieldLabellingProps)}
      helpText={helpText}
      errorMessage={errorMessage}
      state={state}
      labelPosition={labelPosition}
      disabled={disabled}
      slotProps={slotProps}
    >
      <BaseSelect.Root
        // base-ui's generic value; our discriminated public API is the source of truth.
        multiple={multiple as never}
        value={value as never}
        onValueChange={handleValueChange as never}
        items={flatOptions as never}
        readOnly={locked}
        required={required}
        name={name}
      >
        <div className={selectTriggerRow}>
          <BaseSelect.Trigger
            ref={ref}
            className={cx(
              formControlRecipe({ state, size }),
              selectTrigger,
              focusRingRecipe({ type: "visible", offset: "sm" }),
              className,
            )}
            aria-disabled={disabled || undefined}
            aria-busy={loading || undefined}
            // base-ui's `Field.Label` already names the trigger, so this only
            // emits an attribute for the label-less arms.
            {...fieldNameAttrs(nameProps)}
            {...rest}
          >
            <BaseSelect.Value className={selectValue} placeholder={placeholder} />
            <span className={selectEndAdornments}>
              {showClear && <span className={selectClearSlot} aria-hidden />}
              {loading ? (
                <InternalSpinner size="sm" className={selectSpinner} />
              ) : (
                <BaseSelect.Icon className={selectIcon}>
                  <ChevronGlyph />
                </BaseSelect.Icon>
              )}
            </span>
          </BaseSelect.Trigger>
          {showClear && (
            <button
              type="button"
              className={cx(
                selectClearButton({ size }),
                focusRingRecipe({ type: "visible", offset: "sm" }),
              )}
              aria-label="Clear selection"
              onClick={clear}
            >
              <ClearGlyph />
            </button>
          )}
        </div>
        <BaseSelect.Portal>
          <BaseSelect.Positioner
            sideOffset={6}
            side="bottom"
            align="start"
            alignItemWithTrigger={false}
          >
            <BaseSelect.Popup
              className={cx(
                surfaceRecipe({ intent: "neutral", saliency: "low", padding: "none" }),
                selectPopup,
              )}
            >
              <BaseSelect.List className={selectList}>
                {isGrouped(options)
                  ? options.map((group) => (
                      <BaseSelect.Group key={group.label} className={selectGroup}>
                        <BaseSelect.GroupLabel className={selectGroupLabel}>
                          {group.label}
                        </BaseSelect.GroupLabel>
                        {group.options.map(renderItem)}
                      </BaseSelect.Group>
                    ))
                  : options.map(renderItem)}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </Field>
  );
}
