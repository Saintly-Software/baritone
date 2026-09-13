"use client";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import * as React from "react";
import type { ButtonIconState, ButtonProps } from "../Button";
import type { IconSlot } from "../Icon/renderIcon";
import {
  InternalButton,
  type InternalButtonHtmlAttrs,
} from "../../internal/components/InternalButton";
import type { FormState, Intent, LabelPosition, Saliency, Size } from "../../theme/constants";
import { resolveWidth } from "../../styles/layoutProps";
import { atoms } from "../../styles/sprinkles.css";
import { cx } from "../../utils/cx";
import {
  Field,
  type FieldLabellingInput,
  type FieldLabellingProps,
  type FieldSlotProps,
  joinIds,
} from "../Field";
import { useIsFieldDisabled } from "../Fieldset";
import { toggleGroupDisabled, toggleGroupFillRow, toggleGroupRoot } from "./toggleGroup.css";

export type ToggleGroupOrientation = "horizontal" | "vertical";

const ACTIVE_COMPOSITE_ITEM_ATTR = "data-composite-item-active";

interface ToggleGroupItemContextValue {
  selectedValue: string | null;
  intent: Intent | undefined;
  saliency: Saliency;
  size: Size | undefined;
}

const ToggleGroupItemContext = React.createContext<ToggleGroupItemContextValue>({
  selectedValue: null,
  intent: undefined,
  saliency: "high",
  size: undefined,
});

interface ToggleGroupItemCommonProps<T extends string> {
  value: T;

  className?: string;
}

export interface ToggleGroupItemLabelledProps<
  T extends string,
> extends ToggleGroupItemCommonProps<T> {
  children?: React.ReactNode;

  startIcon?: IconSlot<ButtonIconState>;

  endIcon?: IconSlot<ButtonIconState>;

  icon?: never;

  "aria-label"?: string;
}

export interface ToggleGroupItemIconOnlyProps<
  T extends string,
> extends ToggleGroupItemCommonProps<T> {
  icon: NonNullable<IconSlot<ButtonIconState>>;

  "aria-label": string;

  children?: never;

  startIcon?: never;

  endIcon?: never;
}

export type ToggleGroupItemProps<T extends string> =
  | ToggleGroupItemLabelledProps<T>
  | ToggleGroupItemIconOnlyProps<T>;

function ToggleGroupItem<T extends string>(props: ToggleGroupItemProps<T>) {
  const { value, className } = props;
  const { selectedValue, intent, saliency, size } = React.useContext(ToggleGroupItemContext);
  const selected = value === selectedValue;

  const colour = {
    intent: selected ? intent : "neutral",
    saliency: selected ? saliency : "low",
    size,
    className,
  };

  const consumerProps: ButtonProps =
    props.icon != null
      ? {
          ...colour,
          icon: props.icon,
          "aria-label": props["aria-label"],
        }
      : {
          ...colour,
          children: props.children ?? value,
          startIcon: props.startIcon,
          endIcon: props.endIcon,
        };

  const labelledAriaLabel = props.icon == null ? props["aria-label"] : undefined;

  return (
    <Toggle
      value={value}
      render={(toggleProps) => (
        <InternalButton
          consumerProps={consumerProps}
          htmlAttrs={
            {
              ...toggleProps,
              ...(selected ? { [ACTIVE_COMPOSITE_ITEM_ATTR]: "" } : {}),
              ...(labelledAriaLabel != null ? { "aria-label": labelledAriaLabel } : {}),
            } as InternalButtonHtmlAttrs
          }
        />
      )}
    />
  );
}

interface ToggleGroupSharedProps<T extends string> {
  children: (props: {
    ToggleGroupItem: (props: ToggleGroupItemProps<T>) => React.ReactNode;
  }) => React.ReactNode;

  intent?: Intent;

  saliency?: Saliency;

  size?: Size;

  orientation?: ToggleGroupOrientation;

  width?: "fill";

  disabled?: boolean;

  helpText?: React.ReactNode;

  state?: FormState;

  labelPosition?: LabelPosition;

  slotProps?: FieldSlotProps;

  required?: boolean;

  "aria-describedby"?: string;

  className?: string;

  ref?: React.Ref<HTMLDivElement>;
}

interface ToggleGroupStrictProps<T extends string> {
  value: T;

  onChange: (value: T, event: Event) => void;

  clearable?: false;
}

interface ToggleGroupClearableProps<T extends string> {
  value: T | null;

  onChange: (value: T | null, event: Event) => void;

  clearable: true;
}

type ToggleGroupStrictFullProps<T extends string> = ToggleGroupSharedProps<T> &
  ToggleGroupStrictProps<T> &
  FieldLabellingProps;

type ToggleGroupClearableFullProps<T extends string> = ToggleGroupSharedProps<T> &
  ToggleGroupClearableProps<T> &
  FieldLabellingProps;

export type ToggleGroupProps<T extends string> =
  | ToggleGroupStrictFullProps<T>
  | ToggleGroupClearableFullProps<T>;

export function ToggleGroup<T extends string>(
  props: ToggleGroupStrictFullProps<T>,
): React.JSX.Element;
export function ToggleGroup<T extends string>(
  props: ToggleGroupClearableFullProps<T>,
): React.JSX.Element;
export function ToggleGroup<T extends string>(props: ToggleGroupProps<T>) {
  const {
    value,
    onChange,
    clearable = false,
    children,
    intent,
    saliency = "high",
    size,
    orientation = "horizontal",
    width,
    disabled: disabledProp = false,
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    helpText,
    state = "neutral",
    labelPosition = "top",
    slotProps,
    required = false,
    className,
    ref,
  } = props as ToggleGroupClearableProps<T> & ToggleGroupSharedProps<T> & FieldLabellingInput;

  const invalid = state === "invalid";
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;
  const nameProps: FieldLabellingInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  };
  const groupValue = React.useMemo(() => (value === null ? [] : [value]), [value]);

  const itemContext = React.useMemo<ToggleGroupItemContextValue>(
    () => ({ selectedValue: value, intent, saliency, size }),
    [value, intent, saliency, size],
  );

  return (
    <Field
      {...(nameProps as FieldLabellingProps)}
      helpText={helpText}
      state={state}
      required={required}
      labelPosition={labelPosition}
      fit={width === "fill" ? "fill" : "content"}
      disabled={disabled}
      slotProps={slotProps}
    >
      {({ nameAttrs, describedBy }) => (
        <ToggleGroupItemContext.Provider value={itemContext}>
          <BaseToggleGroup
            ref={ref}
            value={groupValue}
            orientation={orientation}
            onValueChange={(next, details) => {
              if (disabled) {
                details.cancel();
                return;
              }
              const selected = next[0];
              if (selected === undefined) {
                if (clearable) {
                  onChange(null, details.event);
                } else {
                  details.cancel();
                }
                return;
              }
              onChange(selected, details.event);
            }}
            {...nameAttrs}
            aria-describedby={joinIds(ariaDescribedby, describedBy)}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            aria-disabled={disabled || undefined}
            className={cx(
              toggleGroupRoot({ orientation }),
              atoms({ width: resolveWidth(width) }),
              orientation === "horizontal" && width === "fill" && toggleGroupFillRow,
              disabled && toggleGroupDisabled,
              className,
            )}
          >
            {children({
              ToggleGroupItem: ToggleGroupItem as (
                props: ToggleGroupItemProps<T>,
              ) => React.ReactNode,
            })}
          </BaseToggleGroup>
        </ToggleGroupItemContext.Provider>
      )}
    </Field>
  );
}
