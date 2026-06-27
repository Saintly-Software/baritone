"use client";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Field } from "@base-ui/react/field";
import * as React from "react";
import { InternalCheckbox } from "../../internal/components/InternalCheckbox";
import { textIntentRecipe, textVariantRecipe } from "../../styles/recipes/text.css";
import { atoms } from "../../styles/sprinkles.css";
import type { FormState, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { checkboxLabelDisabled, checkboxRow, checkboxRowDisabled } from "../Checkbox/checkbox.css";
import { checkboxGroupRoot } from "./checkboxGroup.css";

const wrapperClass = atoms({ display: "flex", flexDirection: "column", gap: "2" });
const labelClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "high" }),
  textVariantRecipe({ family: "body", size: "sm" }),
);
const descriptionClass = cx(
  textIntentRecipe({ intent: "neutral", saliency: "low" }),
  textVariantRecipe({ family: "body", size: "xs" }),
);
const errorClass = cx(
  textIntentRecipe({ intent: "negative", saliency: "high" }),
  textVariantRecipe({ family: "body", size: "xs" }),
);

/** Layout direction of the option list. */
export type CheckboxGroupOrientation = "vertical" | "horizontal";

/**
 * Shared knobs the group hands down to every `CheckboxGroupItem` via context, so
 * an item never has to repeat the group's `size` / `state` / `disabled`, and the
 * item can read the current selection + toggle it without the group re-creating
 * a component per render. The render-prop only carries the *type* `T`; the
 * runtime config flows through here.
 *
 * The selection (`value` / `toggle`) is type-erased to `unknown` here on
 * purpose: the public `CheckboxGroupItem` is bound to the group's `T` at the
 * type level (see `CheckboxGroup`), so an item only ever feeds back a `T`.
 */
interface CheckboxGroupItemContextValue {
  size: Size;
  state: FormState;
  disabled: boolean;
  /** The currently-selected values (membership decides each box's checked state). */
  value: readonly unknown[];
  /** Add (`checked`) or remove (`!checked`) a value from the selection. */
  toggle: (value: unknown, checked: boolean) => void;
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
 * One checkbox option. Stable module-level component (not re-created per render)
 * so React reconciles it normally; type-narrowing to `T` happens purely at the
 * type level where the group hands it to the render-prop.
 *
 * Behaviourally it's the same row as the standalone `Checkbox` — base-ui's
 * `Checkbox.Root` owns the role / keyboard / form wiring, `InternalCheckbox`
 * owns the look, and the box is named explicitly with `aria-labelledby` because
 * base-ui's hidden `<input>` is `aria-hidden`. The only difference is that
 * checked state and toggling are driven by the group's selection array (via
 * context) instead of a local boolean.
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
  // Membership decides checked state. Identity is `===` (via `includes`), which
  // is exactly right for the strings / numbers / enums these options are meant
  // to be; object values would compare by reference.
  const checked = selected.includes(value);
  const labelId = React.useId();
  const content = children ?? defaultLabel(value);

  return (
    <label className={cx(checkboxRow({ size }), itemDisabled && checkboxRowDisabled, className)}>
      <BaseCheckbox.Root
        checked={checked}
        onCheckedChange={(next) => toggle(value, next)}
        // `readOnly` + `aria-disabled` (not `disabled`) so a disabled box stays in
        // the tab order and reachable, while base-ui vetoes the toggle.
        readOnly={itemDisabled}
        aria-disabled={itemDisabled || undefined}
        aria-labelledby={content != null ? labelId : undefined}
        // base-ui now reports `data-readonly`, not `data-disabled`, so the box's
        // dim is driven explicitly from the prop.
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

export interface CheckboxGroupProps<T> {
  /** The currently selected values (controlled). Order is not significant. */
  value: T[];
  /** Called with the next selection whenever an option is ticked or unticked. */
  onChange: (value: T[]) => void;
  /**
   * Render-prop children. Receives a `CheckboxGroupItem` already bound to this
   * group's `T`, so every `<CheckboxGroupItem value={...} />` is type-checked
   * against the same union/enum the group's `value` came from.
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
  /** Group label (also becomes the group's accessible name). */
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Shown (and announced) when `state` is `invalid`. */
  errorMessage?: React.ReactNode;
  /** Disable the whole group. */
  disabled?: boolean;
  /** Extra className merged onto the group element. */
  className?: string;
}

/**
 * CheckboxGroup — a "form control" element type for picking *any number* of
 * values from a small set. It's the multi-select sibling of `RadioGroup`: same
 * `Field`-wrapped label / description / error layout, same type-safe compound
 * API, but the selection is an *array* and each option is an independent
 * checkbox (no roving focus — every box is its own tab stop).
 *
 * It's a **type-safe compound component**: the group is generic over the value
 * type `T` (inferred from `value`), and hands the render-prop a
 * `CheckboxGroupItem` bound to that `T`. So the options can only ever be values
 * from the same union/enum — works for any enum, not just one. See
 * https://tkdodo.eu/blog/building-type-safe-compound-components
 *
 * Each row is the same box + label as the standalone `Checkbox` (built on
 * base-ui's `Checkbox.Root` + `InternalCheckbox`); the group itself is a
 * labelled `role="group"`, so the whole control reads as one named set.
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
export function CheckboxGroup<T>({
  value,
  onChange,
  children,
  state = "neutral",
  size = "md",
  orientation = "vertical",
  label,
  description,
  errorMessage,
  disabled = false,
  className,
}: CheckboxGroupProps<T>) {
  const labelId = React.useId();

  // `onChange` is referenced from `toggle` below; keep the latest in a ref so the
  // memoised context value doesn't have to change identity on every `onChange`.
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const toggle = React.useCallback(
    (toggled: unknown, checked: boolean) => {
      const current = value as readonly T[];
      const next = checked ? [...current, toggled as T] : current.filter((v) => v !== toggled);
      onChangeRef.current(next);
    },
    [value],
  );

  const itemContext = React.useMemo<CheckboxGroupItemContextValue>(
    () => ({ size, state, disabled, value: value as readonly unknown[], toggle }),
    [size, state, disabled, value, toggle],
  );

  return (
    // No `disabled` on `Field.Root`: base-ui propagates it through the field
    // context as the native `disabled` attribute on every box, dropping them from
    // the tab order. Each item handles disable via `aria-disabled` + `readOnly`
    // (group disable flows to items through `CheckboxGroupItemContext`).
    <Field.Root className={wrapperClass} invalid={state === "invalid"}>
      {label != null && (
        <Field.Label id={labelId} className={labelClass}>
          {label}
        </Field.Label>
      )}
      <CheckboxGroupItemContext.Provider value={itemContext}>
        <div
          role="group"
          aria-labelledby={label != null ? labelId : undefined}
          className={cx(checkboxGroupRoot({ orientation }), className)}
        >
          {children({
            // The stable generic item, narrowed to this group's `T`. The cast is
            // purely a type-level instantiation — the runtime function is the same.
            CheckboxGroupItem: CheckboxGroupItem as (
              props: CheckboxGroupItemProps<T>,
            ) => React.ReactNode,
          })}
        </div>
      </CheckboxGroupItemContext.Provider>
      {description != null && (
        <Field.Description className={descriptionClass}>{description}</Field.Description>
      )}
      {state === "invalid" && errorMessage != null && (
        <Field.Error className={errorClass} match>
          {errorMessage}
        </Field.Error>
      )}
    </Field.Root>
  );
}
