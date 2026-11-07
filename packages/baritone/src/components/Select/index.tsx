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

export interface SelectOption {
  label: string;

  value: string;

  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: string;

  options: ReadonlyArray<SelectOption>;
}

function isGrouped(
  options: ReadonlyArray<SelectOption> | ReadonlyArray<SelectOptionGroup>,
): options is ReadonlyArray<SelectOptionGroup> {
  const first = options[0];
  return first != null && "options" in first;
}

interface SelectBaseProps extends Omit<
  React.HTMLAttributes<HTMLButtonElement>,
  "color" | "defaultValue" | "value" | "onChange" | "aria-label" | "aria-labelledby"
> {
  options: ReadonlyArray<SelectOption> | ReadonlyArray<SelectOptionGroup>;

  helpText?: React.ReactNode;

  state?: FormState;

  labelPosition?: LabelPosition;

  slotProps?: FieldSlotProps;

  size?: Size;

  placeholder?: string;

  disabled?: boolean;

  required?: boolean;

  name?: string;

  loading?: boolean;

  hideClearButton?: boolean;

  className?: string;

  ref?: React.Ref<HTMLButtonElement>;
}

export interface SingleSelectProps extends SelectBaseProps {
  multiple?: false;

  value: string | null;

  onChange: (value: string | null, event: Event) => void;
}

export interface MultipleSelectProps extends SelectBaseProps {
  multiple: true;

  value: string[];

  onChange: (value: string[], event: Event) => void;
}

export type SelectProps = (SingleSelectProps | MultipleSelectProps) & FieldLabellingProps;

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
      onChange: (value: never, event: Event) => void;
    };

  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;
  const nameProps: FieldLabellingInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  };

  const emit = onChange as (value: string | string[] | null, event: Event) => void;
  const handleValueChange = (next: string | string[] | null, details: { event: Event }) =>
    emit(next, details.event);
  const clear = (event: React.MouseEvent<HTMLButtonElement>) =>
    emit(multiple ? [] : null, event.nativeEvent);

  const hasValue = multiple ? (value as string[]).length > 0 : value != null;
  const showClear = !hideClearButton && hasValue && !disabled && !loading;
  const locked = disabled || loading;

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
      state={state}
      required={required}
      labelPosition={labelPosition}
      disabled={disabled}
      slotProps={slotProps}
    >
      <BaseSelect.Root
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
