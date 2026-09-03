"use client";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import * as React from "react";
import { InternalCheckbox } from "../../internal/components/InternalCheckbox";
import type { FormState, LabelPosition, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { checkboxLabelDisabled, checkboxRow, checkboxRowDisabled } from "../Checkbox/checkbox.css";
import {
  Field,
  type FieldLabellingInput,
  type FieldLabellingProps,
  type FieldSlotProps,
  joinIds,
} from "../Field";
import { useIsFieldDisabled } from "../Fieldset";
import { srOnly } from "../SrOnly/srOnly.css";
import { checkboxGroupRoot } from "./checkboxGroup.css";

/** Layout direction of the option list. */
export type CheckboxGroupOrientation = "vertical" | "horizontal";

/**
 * Shared knobs the group hands down to every `CheckboxGroupItem` via context, so
 * an item never repeats the group's `size`/`state`/`disabled` and can read +
 * toggle the selection without the group re-creating a component per render.
 *
 * `value`/`toggle` are type-erased to `unknown` on purpose: the public
 * `CheckboxGroupItem` is bound to the group's `T` at the type level, so an
 * item only ever feeds back a `T`.
 */
interface CheckboxGroupItemContextValue {
  size: Size;
  state: FormState;
  disabled: boolean;
  /** The currently-selected values (membership decides each box's checked state). */
  value: readonly unknown[];
  /**
   * Add (`checked`) or remove (`!checked`) a value from the selection, carrying
   * the raw DOM event through to the group's `onChange`.
   */
  toggle: (value: unknown, checked: boolean, event: Event) => void;
}

const CheckboxGroupItemContext = React.createContext<CheckboxGroupItemContextValue>({
  size: "md",
  state: "neutral",
  disabled: false,
  value: [],
  toggle: () => {},
});

export interface CheckboxGroupItemProps<T> {
  /**
   * The value this option contributes to the selection array. Constrained to the
   * group's `T`, so a typo or a value outside the union/enum is a compile error.
   */
  value: T;
  /**
   * The visible label. Defaults to the stringified `value` (handy for string
   * enums); pass children for anything richer or for non-string values.
   */
  children?: React.ReactNode;
  /**
   * Disable just this option (the group can also be disabled as a whole).
   * Modelled with `aria-disabled` + `readOnly` so the box stays focusable.
   */
  disabled?: boolean;
  /** Extra className merged onto the item's `<label>`. */
  className?: string;
}

/** Best-effort default label so `<CheckboxGroupItem value="email" />` renders "email". */
function defaultLabel(value: unknown): React.ReactNode {
  return typeof value === "string" || typeof value === "number" ? String(value) : null;
}

/**
 * One checkbox option. A stable module-level component (not re-created per
 * render) so React reconciles it normally; narrowing to `T` happens purely at
 * the type level where the group hands it to the render-prop.
 *
 * Same row as the standalone `Checkbox` (base-ui's `Checkbox.Root` for role/
 * keyboard/form wiring, `InternalCheckbox` for the look, `aria-labelledby`
 * since base-ui's hidden `<input>` is `aria-hidden`), except checked state and
 * toggling come from the group's selection array via context.
 */
function CheckboxGroupItem<T>({
  value,
  children,
  disabled = false,
  className,
}: CheckboxGroupItemProps<T>) {
  const {
    size,
    state,
    disabled: groupDisabled,
    value: selected,
    toggle,
  } = React.useContext(CheckboxGroupItemContext);
  const itemDisabled = groupDisabled || disabled;
  // Membership decides checked state, via `===` identity (`includes`) — right
  // for the strings/numbers/enums these options are meant to hold.
  const checked = selected.includes(value);
  const labelId = React.useId();
  const content = children ?? defaultLabel(value);

  return (
    <label className={cx(checkboxRow({ size }), itemDisabled && checkboxRowDisabled, className)}>
      <BaseCheckbox.Root
        checked={checked}
        onCheckedChange={(next, details) => toggle(value, next, details.event)}
        // `readOnly` + `aria-disabled` (not `disabled`) keeps a disabled box
        // reachable while base-ui vetoes the toggle.
        readOnly={itemDisabled}
        aria-disabled={itemDisabled || undefined}
        aria-labelledby={content != null ? labelId : undefined}
        // base-ui reports `data-readonly`, not `data-disabled`, so dim is
        // driven explicitly from the prop.
        render={
          <InternalCheckbox checked={checked} disabled={itemDisabled} state={state} size={size} />
        }
      />
      {content != null && (
        <span id={labelId} className={cx(itemDisabled && checkboxLabelDisabled)}>
          {content}
        </span>
      )}
    </label>
  );
}

interface CheckboxGroupBaseProps<T> {
  /** The currently selected values (controlled). Order is not significant. */
  value: T[];
  /**
   * Called whenever an option is ticked or unticked, with the next selection
   * first and the raw DOM event that drove it second (base-ui's native `event`).
   */
  onChange: (value: T[], event: Event) => void;
  /**
   * Render-prop children, receiving a `CheckboxGroupItem` bound to this
   * group's `T` — every `<CheckboxGroupItem value={...} />` is type-checked
   * against it.
   */
  children: (props: {
    CheckboxGroupItem: (props: CheckboxGroupItemProps<T>) => React.ReactNode;
  }) => React.ReactNode;
  /** Validation state. `invalid` maps to negative, `valid` to positive. */
  state?: FormState;
  /** Control size. Default `md`. */
  size?: Size;
  /** Lay the options out in a column (default) or a row. */
  orientation?: CheckboxGroupOrientation;
  /** Inline help under the options, wired to the group's `aria-describedby`. */
  helpText?: React.ReactNode;
  /** Where the label sits. `top` (default) stacks it above; `start`/`end` inline it. */
  labelPosition?: LabelPosition;
  /** Per-slot overrides for the label / help-text pieces. */
  slotProps?: FieldSlotProps;
  /**
   * Mark the group required: shows the `Field`'s asterisk and announces
   * "Required" via the description — `role="group"` has no `aria-required`,
   * and per-box would wrongly imply every box is required.
   */
  required?: boolean;
  /** Disable the whole group. */
  disabled?: boolean;
  /** Points the group at extra descriptive text; combines with `helpText`. */
  "aria-describedby"?: string;
  /** Extra className merged onto the group element. */
  className?: string;
}

/**
 * Named by exactly one of `label` / `aria-label` / `aria-labelledby` — they're
 * mutually exclusive (see `FieldLabellingProps`).
 */
export type CheckboxGroupProps<T> = CheckboxGroupBaseProps<T> & FieldLabellingProps;

/**
 * CheckboxGroup — a "form control" for picking *any number* of values from a
 * small set. The multi-select sibling of `RadioGroup`: same `Field`-composed
 * layout and type-safe compound API, but the selection is an array and each
 * option is an independent checkbox (no roving focus — every box its own tab
 * stop).
 *
 * A **type-safe compound component**: generic over the value type `T`
 * (inferred from `value`), handing the render-prop a `CheckboxGroupItem`
 * bound to that `T`, so options can only be values from the same union/enum.
 * See https://tkdodo.eu/blog/building-type-safe-compound-components
 *
 * Each row is the same box + label as the standalone `Checkbox`; the group
 * itself is a labelled `role="group"`, so it reads as one named set.
 *
 * @example
 * type Topic = "product" | "billing" | "security";
 * const [topics, setTopics] = React.useState<Topic[]>(["product"]);
 * <CheckboxGroup label="Email me about" value={topics} onChange={setTopics}>
 *   {({ CheckboxGroupItem }) => (
 *     <>
 *       <CheckboxGroupItem value="product">Product updates</CheckboxGroupItem>
 *       <CheckboxGroupItem value="billing">Billing</CheckboxGroupItem>
 *       <CheckboxGroupItem value="security">Security alerts</CheckboxGroupItem>
 *     </>
 *   )}
 * </CheckboxGroup>
 */
export function CheckboxGroup<T>(props: CheckboxGroupProps<T>) {
  const {
    value,
    onChange,
    children,
    state = "neutral",
    size = "md",
    orientation = "vertical",
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    helpText,
    labelPosition = "top",
    slotProps,
    required = false,
    disabled: disabledProp = false,
    className,
  } = props as CheckboxGroupBaseProps<T> & FieldLabellingInput;

  // see `useIsFieldDisabled`
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;
  const nameProps: FieldLabellingInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  };

  // Keep latest `onChange` in a ref so the memoised context value doesn't
  // change identity on every `onChange`.
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const toggle = React.useCallback(
    (toggled: unknown, checked: boolean, event: Event) => {
      const current = value as readonly T[];
      const next = checked ? [...current, toggled as T] : current.filter((v) => v !== toggled);
      onChangeRef.current(next, event);
    },
    [value],
  );

  const itemContext = React.useMemo<CheckboxGroupItemContextValue>(
    () => ({ size, state, disabled, value: value as readonly unknown[], toggle }),
    [size, state, disabled, value, toggle],
  );

  // Announced-required id (see the group's `aria-describedby` below).
  const requiredHintId = React.useId();

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
      {/*
        A bare `<div role="group">` that base-ui's field context can't see, so
        it takes naming/description wiring from the render prop by hand.
      */}
      {({ nameAttrs, describedBy }) => (
        <CheckboxGroupItemContext.Provider value={itemContext}>
          <div
            role="group"
            {...nameAttrs}
            // ARIA has no `aria-required` for `role="group"`, and per-item would
            // wrongly imply every box is required — so `required` rides the
            // group's description instead (AGENTS.md: "required goes on both").
            aria-describedby={joinIds(
              required ? requiredHintId : undefined,
              ariaDescribedby,
              describedBy,
            )}
            className={cx(checkboxGroupRoot({ orientation }), className)}
          >
            {required && (
              <span id={requiredHintId} className={srOnly}>
                Required
              </span>
            )}
            {children({
              // The generic item narrowed to this group's `T` — a type-level
              // cast only; the runtime function is the same.
              CheckboxGroupItem: CheckboxGroupItem as (
                props: CheckboxGroupItemProps<T>,
              ) => React.ReactNode,
            })}
          </div>
        </CheckboxGroupItemContext.Provider>
      )}
    </Field>
  );
}
