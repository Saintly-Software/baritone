"use client";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import * as React from "react";
import {
  InternalButton,
  type InternalButtonHtmlAttrs,
} from "../../internal/components/InternalButton";
import type { FormState, Intent, LabelPosition, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import {
  Field,
  type FieldLabellingInput,
  type FieldLabellingProps,
  type FieldSlotProps,
  joinIds,
} from "../Field";
import { useIsFieldDisabled } from "../Fieldset";
import { toggleGroupDisabled, toggleGroupRoot } from "./toggleGroup.css";

/**
 * base-ui's composite reads this attribute — once, the first time it maps the
 * items — to choose the initial roving tab stop. Marking the *selected* toggle
 * with it is what makes Tab land on the selected item rather than the first one.
 * (`Tabs`/`Radio` set it from their own selected state; `Toggle` doesn't, so we
 * set it ourselves.) Empty string so `hasAttribute` is true; omitted otherwise.
 */
const ACTIVE_COMPOSITE_ITEM_ATTR = "data-composite-item-active";

/**
 * Shared knobs the group hands every `ToggleGroupItem` via context, so an item
 * never has to repeat the group's config. The item only needs to know the
 * selected value (to render its on/off look + the active-tab-stop marker) and the
 * colour/size that look is drawn with.
 */
interface ToggleGroupItemContextValue {
  /**
   * The group's selected value, or `null` when nothing is selected. `null` (not
   * `""`) is the "no selection" sentinel so an empty-string segment value stays a
   * real, distinct value — `value === selectedValue` never matches a `null` group.
   */
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

export interface ToggleGroupItemProps<T extends string> {
  /**
   * The value this segment selects. Constrained to the group's `T`, so a typo or
   * a value outside the union/enum is a compile error.
   */
  value: T;
  /**
   * The visible label. Defaults to the `value` itself (handy for string enums);
   * pass children for anything richer.
   */
  children?: React.ReactNode;
  /**
   * An authored accessible name for the segment, for when the flattened text of
   * `children` would name it misleadingly — e.g. a label paired with a trailing
   * count `Badge` ("Comments" + "3" would otherwise announce as "Comments 3").
   * When set, it becomes the segment's whole accessible name, so it must still
   * contain the visible label text (WCAG 2.5.3 *Label in Name*). Leave it off
   * when `children` already reads correctly (the common case).
   */
  "aria-label"?: string;
  /** Extra className merged onto the segment's `<button>`. */
  className?: string;
}

/**
 * One segment, rendered as the very same `InternalButton` that powers `Button`.
 * Its on/off look is expressed through the shared `component` colour recipe: the
 * selected segment takes the group's `intent` x `saliency`, an unselected one
 * drops to a neutral `low` (ghost) — so the chosen value reads as a filled block
 * among ghosts, exactly like `ToggleButton`'s pressed/unpressed.
 *
 * Stable module-level component (not re-created per render) so React reconciles
 * it normally; the type-narrowing to `T` happens purely where the group hands it
 * to the render-prop.
 */
function ToggleGroupItem<T extends string>({
  value,
  children,
  "aria-label": ariaLabel,
  className,
}: ToggleGroupItemProps<T>) {
  const { selectedValue, intent, saliency, size } = React.useContext(ToggleGroupItemContext);
  const selected = value === selectedValue;
  const content = children ?? value;

  return (
    <Toggle
      value={value}
      // base-ui's `Toggle` computes its props (the `aria-pressed` flag, the toggle
      // `onClick`, and the composite's roving `tabIndex` / focus wiring) and hands
      // them in through `InternalButton`'s `htmlAttrs` seam — the same seam an
      // overlay `Trigger` uses. So the rendered element stays a real `<button>`
      // that is the composite item, with no extra wrapper.
      render={(toggleProps) => (
        <InternalButton
          consumerProps={{
            intent: selected ? intent : "neutral",
            saliency: selected ? saliency : "low",
            size,
            className,
            children: content,
          }}
          htmlAttrs={
            // Both the active-tab-stop marker and an authored `aria-label` ride
            // this `htmlAttrs` seam rather than `consumerProps`: `InternalButton`
            // strips `aria-label` off a text button's `consumerProps` (its name
            // must be the visible label there), whereas `htmlAttrs` is merged
            // *under* the button's own props — which never set `aria-label` here —
            // so an authored name survives. data-* isn't statically known on
            // base-ui's props, hence the localized cast (same pattern as the
            // overlay triggers).
            {
              ...toggleProps,
              // The selected segment carries the active-tab-stop marker, so Tab
              // focuses it rather than the first segment.
              ...(selected ? { [ACTIVE_COMPOSITE_ITEM_ATTR]: "" } : {}),
              ...(ariaLabel != null ? { "aria-label": ariaLabel } : {}),
            } as InternalButtonHtmlAttrs
          }
        />
      )}
    />
  );
}

interface ToggleGroupSharedProps<T extends string> {
  /**
   * Render-prop children. Receives a `ToggleGroupItem` already bound to this
   * group's `T`, so every `<ToggleGroupItem value={...} />` is type-checked
   * against the same union/enum the group's `value` came from.
   */
  children: (props: {
    ToggleGroupItem: (props: ToggleGroupItemProps<T>) => React.ReactNode;
  }) => React.ReactNode;
  /** Colour scheme of the selected segment. Shared with `Button` / `Chip`. Default `neutral`. */
  intent?: Intent;
  /**
   * Prominence of the selected segment: `high` (filled, default), `mid` (washed),
   * `low` (transparent + border). Unselected segments always render neutral `low`.
   */
  saliency?: Saliency;
  /** Control size; matches `Button`. Default `md`. */
  size?: Size;
  /**
   * Disable the whole group. Modelled with `aria-disabled` + a veto in the change
   * handler (never the native attribute), so every segment stays keyboard
   * reachable — you can still Tab in and arrow between them — but the value can't
   * change.
   */
  disabled?: boolean;
  /** Inline help shown under the group and wired via `aria-describedby`. */
  helpText?: React.ReactNode;
  /**
   * Validation state. `invalid` flags the group `aria-invalid` and reddens the
   * `helpText`; the toolbar `intent`/`saliency` still own the segment colours.
   * Default `neutral`.
   */
  state?: FormState;
  /** Where the label sits. `top` (default) stacks it above; `start`/`end` inline it. */
  labelPosition?: LabelPosition;
  /** Per-slot overrides for the label / help-text pieces. */
  slotProps?: FieldSlotProps;
  /** Mark the group as required (sets `aria-required`). */
  required?: boolean;
  /** Points the group at extra descriptive text; combines with `helpText`. */
  "aria-describedby"?: string;
  /** Extra className merged onto the group container. */
  className?: string;
  /** Ref to the group container element. */
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * The strict, single-select arm (the default). Exactly one value is always
 * selected, like `RadioGroup`: `null` is not assignable, and re-pressing the
 * active segment can't clear it, so `onChange` only ever emits a real `T`.
 */
interface ToggleGroupStrictProps<T extends string> {
  /** The currently selected value (controlled). Always exactly one. */
  value: T;
  /**
   * Called with the newly selected value first and the raw DOM event that drove
   * the selection second (base-ui's native `event`). Not called when the group
   * is disabled.
   */
  onChange: (value: T, event: Event) => void;
  /** Off (or omitted): the group is strictly single-select. See {@link ToggleGroupClearableProps}. */
  clearable?: false;
}

/**
 * The opt-in clearable arm. `value` also accepts `null` (nothing selected), and
 * re-pressing the active segment clears the selection — so `onChange` can emit
 * `null` too, and callers must handle it.
 */
interface ToggleGroupClearableProps<T extends string> {
  /** The currently selected value (controlled), or `null` for nothing selected. */
  value: T | null;
  /**
   * Called with the newly selected value — or `null` when the active segment is
   * re-pressed to clear the selection — first, and the raw DOM event that drove
   * it second. Not called when the group is disabled.
   */
  onChange: (value: T | null, event: Event) => void;
  /** Allow an empty (unselected) value and let re-pressing the active segment clear it. */
  clearable: true;
}

/**
 * The full strict-mode props: shared knobs + the strict `value`/`onChange` + the
 * naming union. This is one overload arm (see {@link ToggleGroup}).
 */
type ToggleGroupStrictFullProps<T extends string> = ToggleGroupSharedProps<T> &
  ToggleGroupStrictProps<T> &
  FieldLabellingProps;

/**
 * The full clearable-mode props: shared knobs + the nullable `value`/`onChange` +
 * the naming union. This is the other overload arm (see {@link ToggleGroup}).
 */
type ToggleGroupClearableFullProps<T extends string> = ToggleGroupSharedProps<T> &
  ToggleGroupClearableProps<T> &
  FieldLabellingProps;

/**
 * Named by exactly one of `label` / `aria-label` / `aria-labelledby` — they're
 * mutually exclusive (see `FieldLabellingProps`). A visible `label` also flips
 * the control into **form-control semantics**: a labelled group, alongside the
 * toolbar styling. A bare toolbar names itself with `aria-label`.
 *
 * The `value` / `onChange` pair is discriminated by `clearable`: omitted (or
 * `false`) keeps the strict single-select contract; `clearable` widens both to
 * accept `null`.
 *
 * The component itself is *overloaded* on these two arms rather than typed by
 * this union — a union of two generic shapes defeats `T` inference (the strict
 * arm's `value: T` yields a `T = value's-type-including-null` candidate that,
 * failing `T extends string`, collapses `T` to `string`). Overloads let each arm
 * infer `T` on its own, so consumers never have to spell out `<ToggleGroup<T>>`.
 */
export type ToggleGroupProps<T extends string> =
  | ToggleGroupStrictFullProps<T>
  | ToggleGroupClearableFullProps<T>;

/**
 * ToggleGroup — a single-select segmented control: a row of toggle buttons where
 * exactly one is selected, built on base-ui's `ToggleGroup` / `Toggle` (roving
 * focus, arrow-key navigation, `group` ARIA wiring) and rendered with the same
 * `InternalButton` as `Button`.
 *
 * Like `RadioGroup`, it's a **type-safe compound component**: the group is generic
 * over the value type `T` (inferred from `value`), and hands the render-prop a
 * `ToggleGroupItem` bound to that `T`, so the segments can only ever be values
 * from the same union/enum. Because base-ui keys toggles by string, `T` is
 * constrained to `string` (string unions / string enums).
 * See https://tkdodo.eu/blog/building-type-safe-compound-components
 *
 * **Keyboard** (a toolbar-style roving tab stop, *not* a radio group — selection
 * is manual, not on focus): Tab moves into the group and lands on the *selected*
 * segment; the arrow keys move focus between segments *without* selecting; Enter
 * (or Space) selects the focused segment. While `disabled`, all of that still
 * works except the final selection — you can explore the group, you just can't
 * change its value.
 *
 * It doubles as a **labelled form control**: pass `label` (plus optional
 * `helpText`, a validation `state`, or `required`) and the
 * group renders field semantics — a named group with inline help / error text
 * wired through `aria-describedby` — while keeping the same toolbar look.
 *
 * By default exactly one segment is always selected. Opt into an empty state
 * with `clearable`: `value` then also accepts `null` (nothing selected), and
 * re-pressing the active segment clears the selection back to `null`.
 *
 * @example
 * // Toolbar mode.
 * type View = "list" | "board" | "calendar";
 * const [view, setView] = React.useState<View>("list");
 * <ToggleGroup aria-label="View" value={view} onChange={setView} intent="primary">
 *   {({ ToggleGroupItem }) => (
 *     <>
 *       <ToggleGroupItem value="list">List</ToggleGroupItem>
 *       <ToggleGroupItem value="board">Board</ToggleGroupItem>
 *       <ToggleGroupItem value="calendar">Calendar</ToggleGroupItem>
 *     </>
 *   )}
 * </ToggleGroup>
 *
 * @example
 * // Form-control mode: labelled, required, with inline help.
 * <ToggleGroup label="Default view" required helpText="Applies to new boards." value={view} onChange={setView}>
 *   {({ ToggleGroupItem }) => (
 *     <>
 *       <ToggleGroupItem value="list">List</ToggleGroupItem>
 *       <ToggleGroupItem value="board">Board</ToggleGroupItem>
 *     </>
 *   )}
 * </ToggleGroup>
 *
 * @example
 * // Clearable: start unselected, and let re-pressing the active segment clear it.
 * const [view, setView] = React.useState<View | null>(null);
 * <ToggleGroup aria-label="View" clearable value={view} onChange={setView}>
 *   {({ ToggleGroupItem }) => (
 *     <>
 *       <ToggleGroupItem value="list">List</ToggleGroupItem>
 *       <ToggleGroupItem value="board">Board</ToggleGroupItem>
 *     </>
 *   )}
 * </ToggleGroup>
 */
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
    // The public type is discriminated by `clearable`; internally we work with the
    // widened arm (value/onChange over `T | null`) and narrow back at the call site.
  } = props as ToggleGroupClearableProps<T> & ToggleGroupSharedProps<T> & FieldLabellingInput;

  const invalid = state === "invalid";
  // A wrapping `Fieldset` can disable the whole group; OR it into the local prop.
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;
  const nameProps: FieldLabellingInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  };
  // base-ui's group value is an array (it supports multi-select); single-select
  // is just a one-element array, and a cleared/unselected group is the empty
  // array. Memoised so the controlled value is referentially stable across renders.
  const groupValue = React.useMemo(() => (value === null ? [] : [value]), [value]);

  const itemContext = React.useMemo<ToggleGroupItemContextValue>(
    // Pass `value` through as-is: when it's `null`, no segment's `value === null`,
    // so none renders selected — and an empty-string segment stays distinct.
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
      // Shrink-wrap around the segmented row instead of spanning the line.
      fit="content"
      disabled={disabled}
      slotProps={slotProps}
    >
      {/*
        base-ui's toolbar isn't a field control, so its field context can't reach
        it — the naming and description wiring comes from the render prop.
      */}
      {({ nameAttrs, describedBy }) => (
        <ToggleGroupItemContext.Provider value={itemContext}>
          <BaseToggleGroup
            ref={ref}
            value={groupValue}
            onValueChange={(next, details) => {
              // Veto every change when disabled — the whole control is read-only.
              // base-ui shares this `details` with the toggle, so `cancel()` stops
              // the controlled value from changing (no flicker).
              if (disabled) {
                details.cancel();
                return;
              }
              // Re-pressing the active segment clears it: base-ui reports an empty
              // array. When `clearable`, that's a real change to `null`; otherwise
              // the group keeps exactly one value, so veto it.
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
            // Disabled is modelled like the other groups: `aria-disabled` on the
            // container (announced) + the veto above, NOT base-ui's `disabled` (which
            // would natively disable every toggle, dropping the group from the tab
            // order and stopping arrow navigation). So a disabled group stays fully
            // Tab/arrow reachable — see AGENTS.md.
            aria-disabled={disabled || undefined}
            className={cx(toggleGroupRoot, disabled && toggleGroupDisabled, className)}
          >
            {children({
              // The stable generic item, narrowed to this group's `T`. The cast is
              // purely a type-level instantiation — the runtime function is the same.
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
