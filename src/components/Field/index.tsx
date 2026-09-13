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

/**
 * Per-slot overrides for the label and help-text pieces, layered onto each slot's
 * own defaults. A `className` set here merges onto (doesn't replace) the built-in class.
 */
export interface FieldSlotProps {
  /** Props for the `<label>` above (or beside) the control. */
  label?: React.ComponentPropsWithoutRef<typeof BaseField.Label>;
  /** Props for the `HelpText` under the control, in every `state`. */
  helpText?: Partial<HelpTextProps>;
  /** Props for the label's `InfoButton` (only rendered when `info` is set). */
  info?: Partial<InfoButtonProps>;
}

/**
 * The three **mutually exclusive** ways to give a form control an accessible name:
 *
 * - **`label`** — a visible `<label>` (the default, and nearly always right).
 * - **`aria-label`** — an invisible string name, for a visually obvious control.
 * - **`aria-labelledby`** — names the control by pointing at an existing element.
 *
 * Passing more than one is a type error: `aria-label`/`aria-labelledby` override
 * the visible `<label>`, so a control showing one name and announcing another is
 * a bug. Compose into a control's props with an intersection:
 *
 * ```ts
 * export type MyControlProps = MyControlBaseProps & FieldLabellingProps;
 * ```
 */
export type FieldLabellingProps =
  | { label?: React.ReactNode; "aria-label"?: never; "aria-labelledby"?: never }
  | { label?: never; "aria-label"?: string; "aria-labelledby"?: never }
  | { label?: never; "aria-label"?: never; "aria-labelledby"?: string };

/** The labelling props, widened so internals can read all three in one place. */
export interface FieldLabellingInput {
  label?: React.ReactNode;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

const isDev = (): boolean =>
  typeof process === "undefined" || process.env.NODE_ENV !== "production";

/**
 * Enforce the labelling props' mutual exclusivity at runtime, for JS callers the
 * type union can't reach. **Throws** — a mislabelled control is a bug, not a
 * degradable condition. Dev/test only, so it dead-code-eliminates from the
 * bundle. `Field` calls it for its controls; a control that renders its own label
 * (`Checkbox` / `Switch`) must call it directly.
 */
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

/**
 * Resolve the naming attributes to spread onto a form control's focusable
 * element. Pass `labelId` when the visible label must name the control by
 * reference (base-ui's `Checkbox`/`Switch` hide their real `<input>`).
 *
 * Only *defined* attributes are returned: spreading `aria-label={undefined}`
 * through base-ui's `mergeProps` clobbers the field context's name, silently
 * unlabelling the control.
 */
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

/** The labelling props plus the caller's own description pointer. */
export interface FieldControlInput extends FieldLabellingInput {
  "aria-describedby"?: string;
}

/**
 * Every ARIA attribute a form control's focusable element needs from its field,
 * in one spread — {@link fieldNameAttrs} plus the caller's `aria-describedby`:
 *
 * ```tsx
 * <BaseSwitch.Root {...fieldControlAttrs(props, labelId)} />
 * ```
 *
 * Only keys that are actually set come back, so spreading is safe: base-ui's
 * `mergeProps` would otherwise copy an explicit `undefined` over the field
 * context's value, silently unwiring the name or `helpText`. base-ui appends the
 * field's own `helpText` id rather than replacing this one. For a control base-ui
 * can't reach, combine the ids yourself with {@link joinIds}.
 */
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

/**
 * Join id lists for an `aria-labelledby` / `aria-describedby`, dropping the empty
 * ones and collapsing "nothing to point at" to `undefined` (an empty string would
 * still render the attribute).
 */
export function joinIds(...ids: Array<string | undefined | false>): string | undefined {
  return ids.filter(Boolean).join(" ") || undefined;
}

/**
 * The wiring a control needs when base-ui can't reach it (a bare
 * `<div role="group">`, a toolbar) — handed to `Field`'s render-prop `children`.
 * base-ui's own components are wired through the field context automatically.
 */
export interface FieldWiring {
  /** The naming attributes to spread onto the control. */
  nameAttrs: { "aria-label"?: string; "aria-labelledby"?: string };
  /**
   * The id of the rendered `helpText` for `aria-describedby`, or `undefined`.
   * Combine with any caller-supplied `aria-describedby` via {@link joinIds}.
   */
  describedBy: string | undefined;
  /** The visible label's id, or `undefined` when there is no visible label. */
  labelId: string | undefined;
}

/**
 * Fold a slot's caller-supplied `className` together with the built-in `base`
 * class, returning the function form base-ui accepts.
 */
function mergeSlotClass<S>(
  base: string,
  slot: string | ((state: S) => string | undefined) | undefined,
) {
  return (state: S) => cx(base, typeof slot === "function" ? slot(state) : slot);
}

interface FieldBaseProps {
  /**
   * The control this field wraps — a `Field.Control` or any base-ui form
   * component (wired through the field context automatically). For a control
   * base-ui can't reach, pass a function receiving the {@link FieldWiring} to
   * spread yourself.
   */
  children: React.ReactNode | ((wiring: FieldWiring) => React.ReactNode);
  /**
   * The field's one message line under the control — inline help, or the
   * validation error when `state="invalid"` (negative, with a warning glyph).
   * Rendered as a `HelpText` and combined with any `aria-describedby` on the
   * control. There is deliberately no separate `errorMessage`.
   */
  helpText?: React.ReactNode;
  /**
   * Extra explanation surfaced in an `InfoButton` beside the `label` (never part
   * of the control's accessible name). Rendered only with a visible `label`; name
   * the button via `slotProps.info["aria-label"]` (defaults to "More information").
   */
  info?: React.ReactNode;
  /**
   * Mark the field required — a decorative (`aria-hidden`) `*` marker beside the
   * label. The announced semantics come from the control, so pass `required`
   * there too.
   */
  required?: boolean;
  /** Validation state. `invalid` reddens the `helpText` and sets `aria-invalid`. */
  state?: FormState;
  /** Where the label sits. `top` (default) stacks it above; `start`/`end` inline it. */
  labelPosition?: LabelPosition;
  /** Claim the line (`fill`, default) or shrink-wrap the content (`content`). */
  fit?: "fill" | "content";
  /**
   * Dim the label and help text. Does **not** disable the control — pass
   * `disabled` there yourself (see AGENTS.md). Overridden by an enclosing
   * `Fieldset`'s disabled state.
   */
  disabled?: boolean;
  /** Per-slot overrides for the label / help-text / info pieces. */
  slotProps?: FieldSlotProps;
  /** Extra className merged onto the field root. */
  className?: string;
}

export type FieldProps = FieldBaseProps & FieldLabellingProps;

/**
 * The layout + ARIA primitive every form control is built from: it pairs a label
 * and help / error text with an arbitrary control, keeping that wiring in one
 * place. It owns naming (`label` / `aria-label` / `aria-labelledby`, mutually
 * exclusive), description (`helpText` → `aria-describedby`), validation
 * (`state="invalid"` → `aria-invalid` + negative help text), and layout
 * (`labelPosition`, `fit`, `info`, `required`).
 *
 * `required` here is only the visible marker; pass `required` to the control too
 * for the announced semantics. There is deliberately no `id` prop (put `id` on
 * the control), and `disabled` is presentational only — it does not forward to
 * base-ui's `Field.Root` (see AGENTS.md).
 *
 * @example
 * // The common case — a labelled control with help text.
 * <Field label="Email" helpText="We'll never share it.">
 *   <Field.Control render={<input />} />
 * </Field>
 *
 * @example
 * // Invalid, with the label inline.
 * <Field label="Age" labelPosition="start" state="invalid" helpText="Must be a number">
 *   <Field.Control render={<input />} />
 * </Field>
 */
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

/**
 * The control slot — base-ui's `Field.Control`, re-exported so a control can be
 * wired to the field without importing base-ui directly. Renders an `<input>` by
 * default; use `render` for anything else.
 */
Field.Control = BaseField.Control;
