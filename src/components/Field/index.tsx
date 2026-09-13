"use client";
import { Field as BaseField } from "@base-ui/react/field";
import * as React from "react";
import { textIntentRecipe, textSizeRecipe } from "../../styles/recipes/text.css";
import type { FormState, LabelPosition } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useIsFieldDisabled } from "../Fieldset";
import { HelpText, type HelpTextProps } from "../HelpText";
import { InfoButton, type InfoButtonProps } from "../InfoButton";
import {
  fieldLabelDisabled,
  fieldLabelRow,
  fieldRequiredMarker,
  fieldRoot,
  fieldStack,
} from "./field.css";

const labelClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "high" }),
  textSizeRecipe({ size: "sm" }),
);

export interface FieldSlotProps {
  label?: React.ComponentPropsWithoutRef<typeof BaseField.Label>;

  helpText?: Partial<HelpTextProps>;

  info?: Partial<InfoButtonProps>;
}

export type FieldLabellingProps =
  | { label?: React.ReactNode; "aria-label"?: never; "aria-labelledby"?: never }
  | { label?: never; "aria-label"?: string; "aria-labelledby"?: never }
  | { label?: never; "aria-label"?: never; "aria-labelledby"?: string };

export interface FieldLabellingInput {
  label?: React.ReactNode;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

const isDev = (): boolean =>
  typeof process === "undefined" || process.env.NODE_ENV !== "production";

export function assertExclusiveNames(props: FieldLabellingInput, component: string): void {
  if (!isDev()) return;
  const passed = [
    props.label != null && "label",
    props["aria-label"] != null && "aria-label",
    props["aria-labelledby"] != null && "aria-labelledby",
  ].filter((v): v is string => typeof v === "string");
  if (passed.length > 1) {
    throw new Error(
      `[baritone] ${component}: \`${passed.join("`, `")}\` are mutually exclusive — pass exactly ` +
        `one. \`aria-label\`/\`aria-labelledby\` override the visible \`label\` in the accessible ` +
        `name, so the control would show one name and announce another.`,
    );
  }
}

export function fieldNameAttrs(
  props: FieldLabellingInput,
  labelId?: string,
): { "aria-label"?: string; "aria-labelledby"?: string } {
  if (props.label != null) {
    return labelId != null ? { "aria-labelledby": labelId } : {};
  }
  if (props["aria-labelledby"] != null) return { "aria-labelledby": props["aria-labelledby"] };
  if (props["aria-label"] != null) return { "aria-label": props["aria-label"] };
  return {};
}

export interface FieldControlInput extends FieldLabellingInput {
  "aria-describedby"?: string;
}

export function fieldControlAttrs(
  props: FieldControlInput,
  labelId?: string,
): { "aria-label"?: string; "aria-labelledby"?: string; "aria-describedby"?: string } {
  const describedby = props["aria-describedby"];
  return {
    ...fieldNameAttrs(props, labelId),
    ...(describedby != null && { "aria-describedby": describedby }),
  };
}

export function joinIds(...ids: Array<string | undefined | false>): string | undefined {
  return ids.filter(Boolean).join(" ") || undefined;
}

export interface FieldWiring {
  nameAttrs: { "aria-label"?: string; "aria-labelledby"?: string };

  describedBy: string | undefined;

  labelId: string | undefined;
}

function mergeSlotClass<S>(
  base: string,
  slot: string | ((state: S) => string | undefined) | undefined,
) {
  return (state: S) => cx(base, typeof slot === "function" ? slot(state) : slot);
}

interface FieldBaseProps {
  children: React.ReactNode | ((wiring: FieldWiring) => React.ReactNode);

  helpText?: React.ReactNode;

  info?: React.ReactNode;

  required?: boolean;

  state?: FormState;

  labelPosition?: LabelPosition;

  fit?: "fill" | "content";

  disabled?: boolean;

  slotProps?: FieldSlotProps;

  className?: string;
}

export type FieldProps = FieldBaseProps & FieldLabellingProps;

export function Field(props: FieldProps) {
  const nameProps = props as FieldLabellingInput;
  const {
    children,
    label,
    helpText,
    info,
    required = false,
    state = "neutral",
    labelPosition = "top",
    fit = "fill",
    disabled: disabledProp = false,
    slotProps,
    className,
  } = props as FieldBaseProps & FieldLabellingInput;

  assertExclusiveNames(nameProps, "Field");

  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;

  const { className: labelSlotClass, ...labelSlotProps } = slotProps?.label ?? {};
  const helpTextSlotProps = slotProps?.helpText;

  const generatedLabelId = React.useId();
  const helpTextId = React.useId();
  const labelId = label != null ? generatedLabelId : undefined;
  const describedBy = helpText != null ? helpTextId : undefined;

  const labelEl = label != null && (
    <BaseField.Label
      id={generatedLabelId}
      className={mergeSlotClass(cx(labelClass, disabled && fieldLabelDisabled), labelSlotClass)}
      {...labelSlotProps}
    >
      {label}
    </BaseField.Label>
  );

  const hasLabelAdornment = required || info != null;

  return (
    <BaseField.Root
      invalid={state === "invalid"}
      className={cx(fieldRoot({ labelPosition, fit }), className)}
    >
      {labelEl &&
        (hasLabelAdornment ? (
          <div className={fieldLabelRow}>
            {labelEl}
            {required && (
              <span aria-hidden="true" className={fieldRequiredMarker}>
                *
              </span>
            )}
            {info != null && (
              <InfoButton aria-label="More information" {...slotProps?.info}>
                {info}
              </InfoButton>
            )}
          </div>
        ) : (
          labelEl
        ))}
      <div className={fieldStack({ labelPosition })}>
        {typeof children === "function"
          ? children({ nameAttrs: fieldNameAttrs(nameProps, labelId), describedBy, labelId })
          : children}
        {helpText != null && (
          <BaseField.Description
            id={helpTextId}
            render={
              <HelpText
                variant="xs"
                invalid={state === "invalid"}
                disabled={disabled}
                {...helpTextSlotProps}
              >
                {helpText}
              </HelpText>
            }
          />
        )}
      </div>
    </BaseField.Root>
  );
}

Field.Control = BaseField.Control;
