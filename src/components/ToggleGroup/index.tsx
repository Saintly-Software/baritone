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
  selectedValue: string;
  intent: Intent | undefined;
  saliency: Saliency;
  size: Size | undefined;
}

const ToggleGroupItemContext = React.createContext<ToggleGroupItemContextValue>({
  selectedValue: "",
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
            selected
              ? // The selected segment also carries the active-tab-stop marker, so
                // Tab focuses it. data-* isn't statically known on base-ui's props,
                // hence the localized cast (same pattern as the overlay triggers).
                ({ ...toggleProps, [ACTIVE_COMPOSITE_ITEM_ATTR]: "" } as InternalButtonHtmlAttrs)
              : toggleProps
          }
        />
      )}
    />
  );
}

interface ToggleGroupBaseProps<T extends string> {
  /** The currently selected value (controlled). Always exactly one, like `RadioGroup`. */
  value: T;
  /** Called with the newly selected value. Not called when the group is disabled. */
  onChange: (value: T) => void;
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
  /** Shown (and announced) under the group when `state` is `invalid`. */
  errorMessage?: React.ReactNode;
  /**
   * Validation state. `invalid` flags the group `aria-invalid` and reveals the
   * `errorMessage`; the toolbar `intent`/`saliency` still own the segment colours.
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
 * Named by exactly one of `label` / `aria-label` / `aria-labelledby` — they're
 * mutually exclusive (see `FieldLabellingProps`). A visible `label` also flips
 * the control into **form-control semantics**: a labelled group, alongside the
 * toolbar styling. A bare toolbar names itself with `aria-label`.
 */
export type ToggleGroupProps<T extends string> = ToggleGroupBaseProps<T> & FieldLabellingProps;

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
 * `description` / `errorMessage`, a validation `state`, or `required`) and the
 * group renders field semantics — a named group with inline help / error text
 * wired through `aria-describedby` — while keeping the same toolbar look.
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
 * <ToggleGroup label="Default view" required description="Applies to new boards." value={view} onChange={setView}>
 *   {({ ToggleGroupItem }) => (
 *     <>
 *       <ToggleGroupItem value="list">List</ToggleGroupItem>
 *       <ToggleGroupItem value="board">Board</ToggleGroupItem>
 *     </>
 *   )}
 * </ToggleGroup>
 */
export function ToggleGroup<T extends string>(props: ToggleGroupProps<T>) {
  const {
    value,
    onChange,
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
    errorMessage,
    state = "neutral",
    labelPosition = "top",
    slotProps,
    required = false,
    className,
    ref,
  } = props as ToggleGroupBaseProps<T> & FieldLabellingInput;

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
  // is just a one-element array. Memoised so the controlled value is referentially
  // stable across renders.
  const groupValue = React.useMemo(() => [value], [value]);

  const itemContext = React.useMemo<ToggleGroupItemContextValue>(
    () => ({ selectedValue: value, intent, saliency, size }),
    [value, intent, saliency, size],
  );

  return (
    <Field
      {...(nameProps as FieldLabellingProps)}
      helpText={helpText}
      errorMessage={errorMessage}
      state={state}
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
              // The group always keeps exactly one value. Veto when disabled (the whole
              // control is read-only) *or* when re-pressing the active segment would
              // clear the selection (base-ui reports an empty array for that). base-ui
              // shares this `details` with the toggle, so `cancel()` stops the
              // controlled value from changing — no flicker — in both cases.
              const selected = next[0];
              if (disabled || selected === undefined) {
                details.cancel();
                return;
              }
              onChange(selected);
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
