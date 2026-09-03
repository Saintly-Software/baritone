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
 * Per-slot overrides for the label and help-text pieces — every field is
 * partial, layering onto the slot's own defaults. A `className` here merges
 * onto the slot's built-in class rather than replacing it.
 */
export interface FieldSlotProps {
  /** Props for the `<label>` above (or beside) the control. */
  label?: React.ComponentPropsWithoutRef<typeof BaseField.Label>;
  /** Props for the `HelpText` under the control, in every `state`. */
  helpText?: Partial<HelpTextProps>;
  /** Props for the label's `InfoButton` (rendered only when `info` is set). */
  info?: Partial<InfoButtonProps>;
}

/**
 * The three ways to give a form control an accessible name — **mutually
 * exclusive** by construction:
 *
 * - **`label`** — a visible `<label>`. The default, and usually right.
 * - **`aria-label`** — an invisible name, for a control whose purpose is
 *   already visually obvious (an icon-only control).
 * - **`aria-labelledby`** — names the control via an id elsewhere on the page.
 *
 * Passing more than one is a type error: `aria-label`/`aria-labelledby` both
 * override the visible label in the accessible-name calculation, so showing
 * one name while announcing another is always a bug.
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
 * Enforce the labelling props' mutual exclusivity at runtime, for the JS
 * callers the type-level union can't reach. **Throws** rather than warns — a
 * control that shows one name and announces another is an accessibility bug,
 * not something to degrade through silently.
 *
 * Dev/test only, matching `warnOnContrastIssues`: a mislabelled control in
 * production still beats a white screen for the assistive-tech user this
 * rule protects, and this also lets the whole check dead-code-eliminate out
 * of the bundle.
 *
 * `Field` calls this for every control that hands it the labelling props. A
 * control that renders its own label (`Checkbox` / `Switch`) must call it
 * directly.
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
 * element. At most one of the three labelling props is ever set, so there's
 * no precedence to apply.
 *
 * Pass `labelId` when the visible label has to name the control *by
 * reference* (base-ui's `Checkbox`/`Switch` hide their real `<input>`, so a
 * wrapping `<label>` would name that instead of the control). Omit it when
 * base-ui's `Field.Label` already names the control on its own.
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

/** The labelling props plus the caller's own description pointer. */
export interface FieldControlInput extends FieldLabellingInput {
  "aria-describedby"?: string;
}

/**
 * Every ARIA attribute a form control's focusable element needs from its
 * field, in one spread:
 *
 * ```tsx
 * <BaseSwitch.Root {...fieldControlAttrs(props, labelId)} />
 * ```
 *
 * That is {@link fieldNameAttrs} plus the caller's `aria-describedby`. Only
 * keys that are actually set come back — base-ui's `mergeProps` clobbers an
 * existing value with an explicit `undefined`, so a raw
 * `aria-describedby={undefined}` would silently unwire the `helpText`.
 *
 * base-ui *appends* the field's own `helpText` id to whatever
 * `aria-describedby` this emits, rather than replacing it, so a caller's
 * description and the field's help text are both announced. For a control
 * base-ui can't reach, combine the ids yourself with {@link joinIds} instead.
 *
 * A plain function, not a hook: the controls call it from their own bodies —
 * outside `Field`'s provider, since `Field` only renders them as `children`
 * — so a context-reading hook couldn't see the field anyway.
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
 * Join id lists for `aria-labelledby` / `aria-describedby`, dropping the
 * empty ones and collapsing "nothing to point at" to `undefined` (an empty
 * string would still render the attribute).
 */
export function joinIds(...ids: Array<string | undefined | false>): string | undefined {
  return ids.filter(Boolean).join(" ") || undefined;
}

/**
 * The wiring a control needs when base-ui can't reach it — handed to
 * `Field`'s render-prop `children`.
 *
 * base-ui wires its own components (`Field.Control`, `Select`, `RadioGroup`,
 * `Checkbox`, `Switch`) through the field context automatically, so those can
 * just be plain `children`. A control base-ui doesn't know about — a bare
 * `<div role="group">`, a toolbar — has to be pointed at the label and the
 * help / error text explicitly.
 */
export interface FieldWiring {
  /**
   * The naming attributes to spread onto the control. Resolves to
   * `aria-labelledby` pointing at the visible label, or to whichever of
   * `aria-label` / `aria-labelledby` the caller passed.
   */
  nameAttrs: { "aria-label"?: string; "aria-labelledby"?: string };
  /**
   * Id of the rendered `helpText`, for the control's `aria-describedby`
   * (`undefined` when there's none). Combine with a caller-supplied
   * `aria-describedby` via {@link joinIds}.
   */
  describedBy: string | undefined;
  /** The visible label's id, or `undefined` when there is no visible label. */
  labelId: string | undefined;
}

/**
 * Fold a slot's caller-supplied `className` (base-ui's `string | (state) => …`
 * form) onto the built-in `base` class, returning the function form base-ui
 * always accepts.
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
   * component, wired up automatically by base-ui's field context.
   *
   * For a control base-ui *can't* reach (a bare `<div role="group">`, a
   * toolbar), pass a function instead: it receives the {@link FieldWiring} to
   * spread onto the control yourself.
   */
  children: React.ReactNode | ((wiring: FieldWiring) => React.ReactNode);
  /**
   * The field's one message line, under the control: inline help, or the
   * validation error, depending on `state`. Wired to the control's
   * `aria-describedby`, *combining* with (not replacing) any
   * `aria-describedby` already on the control, so an external description
   * and this one are both announced.
   *
   * `state="invalid"` renders it negative, with `HelpText`'s warning glyph.
   * There is deliberately no separate `errorMessage`: one slot, one line, no
   * question of which message wins. Swap the copy yourself when the error
   * needs different words:
   *
   * ```tsx
   * <TextInput state={error ? "invalid" : "neutral"} helpText={error ?? "We'll never share it."} />
   * ```
   */
  helpText?: React.ReactNode;
  /**
   * Extra explanation surfaced in an `InfoButton` (the "i" affordance) beside
   * the `label`. Sits next to the label, not inside it, so it never becomes
   * part of the control's accessible name and clicking it doesn't activate
   * the control. Rendered only when there's a visible `label`. Accessible
   * name defaults to "More information"; override via
   * `slotProps.info["aria-label"]`.
   */
  info?: React.ReactNode;
  /**
   * Mark the field required — renders a marker (`*`) after the label text.
   *
   * The marker is *decorative* (`aria-hidden`) and sits beside the `<label>`
   * rather than inside it, so it can't leak into the control's accessible
   * name. The *semantics* come from the control — a native `<input>` takes
   * the native `required`, base-ui's non-native controls get
   * `aria-required` — so pass `required` to the control too, as every form
   * control in this package does.
   */
  required?: boolean;
  /** Validation state. `invalid` reddens the `helpText` and sets `aria-invalid`. */
  state?: FormState;
  /** Where the label sits. `top` (default) stacks it above; `start`/`end` inline it. */
  labelPosition?: LabelPosition;
  /** Claim the line (`fill`, default) or shrink-wrap the content (`content`). */
  fit?: "fill" | "content";
  /**
   * Dim the label and help text. This does **not** disable the control —
   * pass `disabled` to that yourself, modelled as `aria-disabled` +
   * `readOnly` so it stays focusable (see AGENTS.md). Overridden by an
   * enclosing `Fieldset`'s disabled state when that is set.
   */
  disabled?: boolean;
  /** Per-slot overrides for the label / help-text / info pieces. */
  slotProps?: FieldSlotProps;
  /** Extra className merged onto the field root. */
  className?: string;
}

export type FieldProps = FieldBaseProps & FieldLabellingProps;

/**
 * Field — the layout + ARIA primitive every form control is built from: it
 * pairs a label and help / error text with an arbitrary control, so wiring
 * lives in one place instead of being re-derived per component.
 *
 * It owns four things:
 *
 * 1. **Naming.** `label` / `aria-label` / `aria-labelledby` are mutually
 *    exclusive (see {@link FieldLabellingProps}) — enforced in the types and
 *    warned about at runtime. A visible `label` is associated with the
 *    control by base-ui; for a control base-ui can't reach, spread
 *    {@link fieldNameAttrs} onto the focusable element yourself.
 * 2. **Description.** `helpText` renders a `HelpText` wired to the control's
 *    `aria-describedby`, *combining* with any `aria-describedby` the caller
 *    set rather than replacing it.
 * 3. **Validation.** `state="invalid"` renders the `helpText` negative (with
 *    `HelpText`'s warning glyph) and marks the control `aria-invalid`. One
 *    message slot, not two — see `helpText`.
 * 4. **Layout.** `labelPosition` puts the label above (default) or inline,
 *    and `fit` decides whether the field claims the line or shrink-wraps. An
 *    `info` node hangs an `InfoButton` beside the label, and `required`
 *    marks it.
 *
 * `required` here is only the *visible* half of required-ness; the announced
 * half lives on the control, which the field can't reach — pass `required`
 * to both, as every form control in this package does.
 *
 * There is deliberately no `id` prop: an `id` on base-ui's `Field.Root`
 * doesn't reach the control (base-ui generates one regardless), so it would
 * be a lie. Put `id` on the control instead — base-ui points the label's
 * `for` at it.
 *
 * Note it deliberately does **not** forward `disabled` to base-ui's
 * `Field.Root`: base-ui propagates that to controls as the *native*
 * `disabled` attribute, which drops them from the tab order. Field's
 * `disabled` is presentational (it dims the label and help text); the
 * control models the real thing with `aria-disabled` + `readOnly`. See
 * AGENTS.md.
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
  // Public type is a union over the labelling arms; read here from one widened shape.
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

  // see `useIsFieldDisabled`
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;

  // Split out the label slot's `className` so it merges onto the built-in
  // class instead of clobbering it (mergeSlotClass folds either the string
  // or function form base-ui accepts).
  const { className: labelSlotClass, ...labelSlotProps } = slotProps?.label ?? {};
  const helpTextSlotProps = slotProps?.helpText;

  // Own the part ids rather than letting base-ui generate them: base-ui only
  // wires generated ids to its own components, so a control it can't reach
  // would have nothing to point `aria-describedby` at. This keeps both
  // auto-wiring and the render-prop form working.
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

  // The marker and InfoButton ride beside the label, never inside it: a
  // button inside the `<label>` would join the accessible name and fire on
  // click, and even though an aria-hidden asterisk wouldn't affect the real
  // accessible name, testing-library's `getByLabelText` matches the label's
  // raw `textContent` — so it would break `getByLabelText("Email")` the
  // moment `required` was added.
  const hasLabelAdornment = required || info != null;

  return (
    // No `disabled` on `Field.Root` — see the note in the component doc above.
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
          // Always a `Description`, never base-ui's `Error`: presentation
          // tracks `state`, but it stays wired to `aria-describedby` in
          // every state instead of appearing and disappearing from it.
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
