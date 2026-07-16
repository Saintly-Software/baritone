"use client";
import { Field as BaseField } from "@base-ui/react/field";
import * as React from "react";
import { textIntentRecipe, textVariantRecipe } from "../../styles/recipes/text.css";
import type { FormState, LabelPosition } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useIsFieldDisabled } from "../Fieldset";
import { HelpText, type HelpTextProps } from "../HelpText";
import { InfoButton, type InfoButtonProps } from "../InfoButton";
import { fieldLabelDisabled, fieldLabelRow, fieldRoot, fieldStack } from "./field.css";

const labelClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "high" }),
  textVariantRecipe({ family: "body", size: "sm" }),
);

/**
 * Per-slot overrides for the label and help-text pieces. Every field is partial —
 * you're layering props onto the slot's own defaults, so
 * `slotProps={{ label: { className: "…" }, helpText: { variant: "sm" } }}`
 * re-tunes just those pieces. A `className` set here merges onto (doesn't
 * replace) the slot's built-in class.
 */
export interface FieldSlotProps {
  /** Props for the `<label>` above (or beside) the control. */
  label?: React.ComponentPropsWithoutRef<typeof BaseField.Label>;
  /**
   * Props for the `HelpText` under the control. Applies to the `errorMessage`
   * line too — it is the same component, already forced to `invalid`.
   */
  helpText?: Partial<HelpTextProps>;
  /**
   * Props for the label's `InfoButton` (only rendered when `info` is set). Use it
   * to override the default `aria-label`, or to tune `side` / `intent` / etc.
   */
  info?: Partial<InfoButtonProps>;
}

/**
 * The three ways to give a form control an accessible name — **mutually
 * exclusive** by construction:
 *
 * - **`label`** — a visible `<label>`, associated with the control. The default,
 *   and the right answer nearly always: a visible label helps everyone, not just
 *   screen-reader users.
 * - **`aria-label`** — an invisible string name, for a control whose purpose is
 *   already obvious from its visuals (an icon-only control).
 * - **`aria-labelledby`** — names the control by pointing at an element that
 *   already exists elsewhere on the page.
 *
 * Passing more than one is a type error, because there is no sensible way to
 * resolve it: `aria-labelledby` and `aria-label` both *override* the visible
 * `<label>` in the accessible-name calculation, so a control showing one name
 * and announcing another is always a bug. Picking exactly one also means there
 * is no precedence order to remember.
 *
 * Compose it into a control's props with an intersection (a union can't be
 * `extend`ed):
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
 * type-level union can't reach. Dev-only: a name conflict is a bug to fix, not a
 * condition to handle, so it warns rather than throws.
 *
 * `Field` calls this for every control that hands it the labelling props. A
 * control that renders its *own* label instead (`Checkbox` / `Switch`, whose
 * label lives inside the clickable row) has to call it directly.
 */
export function warnOnConflictingNames(props: FieldLabellingInput, component: string): void {
  if (!isDev()) return;
  const passed = [
    props.label != null && "label",
    props["aria-label"] != null && "aria-label",
    props["aria-labelledby"] != null && "aria-labelledby",
  ].filter((v): v is string => typeof v === "string");
  if (passed.length > 1) {
    console.warn(
      `[baritone] ${component}: \`${passed.join("`, `")}\` are mutually exclusive — pass exactly ` +
        `one. \`aria-label\`/\`aria-labelledby\` override the visible \`label\` in the accessible ` +
        `name, so the control would show one name and announce another.`,
    );
  }
}

/**
 * Resolve the naming attributes to spread onto a form control's focusable
 * element. Because the three labelling props are mutually exclusive there is no
 * precedence to apply — at most one is ever set.
 *
 * Pass `labelId` when the visible label has to name the control *by reference*
 * (base-ui's `Checkbox`/`Switch` hide their real `<input>`, so a wrapping
 * `<label>` would name that instead of the control). Omit it when base-ui's
 * `Field.Label` already names the control on its own.
 *
 * Only *defined* attributes are returned: spreading `aria-label={undefined}`
 * through base-ui's `mergeProps` clobbers the name coming from the field
 * context, silently unlabelling the control.
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

/**
 * Join id lists for an `aria-labelledby` / `aria-describedby`, dropping the empty
 * ones and collapsing "nothing to point at" to `undefined` (an empty string would
 * still render the attribute).
 */
export function joinIds(...ids: Array<string | undefined | false>): string | undefined {
  return ids.filter(Boolean).join(" ") || undefined;
}

/**
 * The wiring a control needs when base-ui can't reach it — handed to `Field`'s
 * render-prop `children`.
 *
 * base-ui wires its *own* components (`Field.Control`, `Select`, `RadioGroup`,
 * `Checkbox`, `Switch`) through the field context automatically, so those can
 * just be plain `children`. A control base-ui doesn't know about — a bare
 * `<div role="group">`, a toolbar — is invisible to that context, and has to be
 * pointed at the label and the help / error text explicitly.
 */
export interface FieldWiring {
  /**
   * The naming attributes to spread onto the control. Resolves to
   * `aria-labelledby` pointing at the visible label, or to whichever of
   * `aria-label` / `aria-labelledby` the caller passed.
   */
  nameAttrs: { "aria-label"?: string; "aria-labelledby"?: string };
  /**
   * The ids of the rendered `helpText` / `errorMessage`, for the control's
   * `aria-describedby`. `undefined` when there's nothing to describe it with.
   * Combine it with any caller-supplied `aria-describedby` via {@link joinIds}.
   */
  describedBy: string | undefined;
  /** The visible label's id, or `undefined` when there is no visible label. */
  labelId: string | undefined;
}

/**
 * Fold a slot's caller-supplied `className` (base-ui's `string | (state) => …`
 * form) together with the built-in `base` class, returning the function form
 * base-ui always accepts. Keeps our base class and lets the caller add to it.
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
   * component, which base-ui's field context wires up on its own.
   *
   * For a control base-ui *can't* reach (a bare `<div role="group">`, a toolbar),
   * pass a function instead: it receives the {@link FieldWiring} to spread onto
   * the control yourself.
   */
  children: React.ReactNode | ((wiring: FieldWiring) => React.ReactNode);
  /**
   * Inline help under the control, rendered as a `HelpText` and wired to the
   * control's `aria-describedby`. It *combines* with any `aria-describedby` you
   * put on the control — base-ui appends rather than replaces — so an external
   * description and this one are both announced.
   */
  helpText?: React.ReactNode;
  /** Shown (and announced) under the control when `state` is `invalid`. */
  errorMessage?: React.ReactNode;
  /**
   * Extra explanation surfaced in an `InfoButton` (the "i" affordance) beside the
   * `label`. It sits *next to* the label rather than inside it, so it never
   * becomes part of the control's accessible name and clicking it doesn't
   * activate the control. Rendered only when there's a visible `label` — with no
   * label there's nothing to hang it on. Give the button an accessible name via
   * `slotProps.info["aria-label"]` (defaults to "More information").
   */
  info?: React.ReactNode;
  /** Validation state. `invalid` reveals `errorMessage` and sets `aria-invalid`. */
  state?: FormState;
  /** Where the label sits. `top` (default) stacks it above; `start`/`end` inline it. */
  labelPosition?: LabelPosition;
  /** Claim the line (`fill`, default) or shrink-wrap the content (`content`). */
  fit?: "fill" | "content";
  /**
   * Dim the label and help text. This does **not** disable the control — pass
   * `disabled` to that yourself, modelled as `aria-disabled` + `readOnly` so it
   * stays focusable (see AGENTS.md). Ignored in favour of an enclosing
   * `Fieldset`'s disabled state when that is set.
   */
  disabled?: boolean;
  /** Per-slot overrides for the label / help-text / info pieces. */
  slotProps?: FieldSlotProps;
  /** Extra className merged onto the field root. */
  className?: string;
}

export type FieldProps = FieldBaseProps & FieldLabellingProps;

/**
 * Field — the layout + ARIA primitive every form control is built from: it pairs
 * a label and help / error text with an arbitrary control, so that wiring lives
 * in one place instead of being re-derived per component.
 *
 * It owns four things:
 *
 * 1. **Naming.** `label` / `aria-label` / `aria-labelledby` are mutually
 *    exclusive (see {@link FieldLabellingProps}) — enforced in the types and
 *    warned about at runtime. A visible `label` is associated with the control by
 *    base-ui; for a control base-ui can't reach, spread {@link fieldNameAttrs}
 *    onto the focusable element yourself.
 * 2. **Description.** `helpText` renders a `HelpText` wired to the control's
 *    `aria-describedby`, *combining* with any `aria-describedby` the caller set
 *    rather than replacing it.
 * 3. **Validation.** `state="invalid"` reveals `errorMessage` (as a negative
 *    `HelpText`) and marks the control `aria-invalid`.
 * 4. **Layout.** `labelPosition` puts the label above (default) or inline, and
 *    `fit` decides whether the field claims the line or shrink-wraps. An `info`
 *    node hangs an `InfoButton` beside the label.
 *
 * There is deliberately no `id` prop: an `id` on base-ui's `Field.Root` doesn't
 * reach the control (base-ui generates one regardless), so it would be a lie.
 * Put `id` on the control instead — base-ui points the label's `for` at it.
 *
 * Note it deliberately does **not** forward `disabled` to base-ui's `Field.Root`:
 * base-ui propagates that to controls as the *native* `disabled` attribute, which
 * drops them from the tab order. Field's `disabled` is presentational (it dims
 * the label and help text); the control models the real thing with
 * `aria-disabled` + `readOnly`. See AGENTS.md.
 *
 * @example
 * // The common case — a labelled control with help text.
 * <Field label="Email" helpText="We'll never share it.">
 *   <Field.Control render={<input />} />
 * </Field>
 *
 * @example
 * // Invalid, with the label inline.
 * <Field label="Age" labelPosition="start" state="invalid" errorMessage="Must be a number">
 *   <Field.Control render={<input />} />
 * </Field>
 */
export function Field(props: FieldProps) {
  // The public type is a union over the labelling arms; internally we read every
  // field from one widened shape.
  const nameProps = props as FieldLabellingInput;
  const {
    children,
    label,
    helpText,
    errorMessage,
    info,
    state = "neutral",
    labelPosition = "top",
    fit = "fill",
    disabled: disabledProp = false,
    slotProps,
    className,
  } = props as FieldBaseProps & FieldLabellingInput;

  warnOnConflictingNames(nameProps, "Field");

  // A wrapping `Fieldset` can disable the whole group; OR it into the local prop.
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;

  // Split the label slot's own `className` out so it merges *onto* the built-in
  // class instead of clobbering it. base-ui's Field parts accept `string` or
  // `(state) => string`; `mergeSlotClass` folds either form onto our base class.
  const { className: labelSlotClass, ...labelSlotProps } = slotProps?.label ?? {};
  const helpTextSlotProps = slotProps?.helpText;

  const showError = state === "invalid" && errorMessage != null;

  // Own the part ids rather than letting base-ui generate them: base-ui only
  // hands its generated ids to its *own* components, so a control it can't reach
  // would have nothing to point `aria-describedby` at. Setting them explicitly
  // keeps base-ui's auto-wiring working *and* lets the render-prop form wire a
  // custom control by hand.
  const generatedLabelId = React.useId();
  const helpTextId = React.useId();
  const errorId = React.useId();
  const labelId = label != null ? generatedLabelId : undefined;
  const describedBy = joinIds(helpText != null && helpTextId, showError && errorId);

  const labelEl = label != null && (
    <BaseField.Label
      id={generatedLabelId}
      className={mergeSlotClass(cx(labelClass, disabled && fieldLabelDisabled), labelSlotClass)}
      {...labelSlotProps}
    >
      {label}
    </BaseField.Label>
  );

  return (
    // No `disabled` on `Field.Root` — see the note in the component doc above.
    <BaseField.Root
      invalid={state === "invalid"}
      className={cx(fieldRoot({ labelPosition, fit }), className)}
    >
      {labelEl &&
        (info != null ? (
          // The InfoButton rides *beside* the label, never inside it: a button
          // within the `<label>` would join the control's accessible name and
          // activate the control when clicked.
          <div className={fieldLabelRow}>
            {labelEl}
            <InfoButton aria-label="More information" {...slotProps?.info}>
              {info}
            </InfoButton>
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
              <HelpText variant="xs" disabled={disabled} {...helpTextSlotProps}>
                {helpText}
              </HelpText>
            }
          />
        )}
        {showError && (
          <BaseField.Error
            match
            id={errorId}
            render={
              <HelpText variant="xs" invalid disabled={disabled} {...helpTextSlotProps}>
                {errorMessage}
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
