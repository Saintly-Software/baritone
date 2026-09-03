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

/** Layout (and keyboard) direction of the segmented control. */
export type ToggleGroupOrientation = "horizontal" | "vertical";

/**
 * base-ui's composite reads this once, when first mapping the items, to choose
 * the initial roving tab stop — marking the *selected* toggle makes Tab land
 * there instead of the first item (`Toggle`, unlike `Tabs`/`Radio`, doesn't set
 * this itself). Empty string so `hasAttribute` is true; omitted otherwise.
 */
const ACTIVE_COMPOSITE_ITEM_ATTR = "data-composite-item-active";

/**
 * Shared knobs the group hands every `ToggleGroupItem` via context, so an item
 * never has to repeat the group's config.
 */
interface ToggleGroupItemContextValue {
  /**
   * The group's selected value, or `null` when nothing is selected. `null` (not
   * `""`) is the sentinel, so an empty-string segment stays a real, distinct value.
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

/**
 * Props shared by *both* `ToggleGroupItem` arms — labelled and icon-only.
 * Deliberately silent on `children`/`icon`/`startIcon`/`endIcon`/`aria-label`,
 * since each arm redefines them differently. Mirrors `Button`'s `ButtonCommonProps` split.
 */
interface ToggleGroupItemCommonProps<T extends string> {
  /**
   * The value this segment selects. Constrained to the group's `T`, so an
   * invalid value is a compile error.
   */
  value: T;
  /** Extra className merged onto the segment's `<button>`. */
  className?: string;
}

/**
 * The labelled segment (the default arm): a visible text label, optionally
 * flanked by icons. Mirrors `Button`'s labelled arm. `icon` is absent here —
 * its presence is what selects the icon-only arm.
 */
export interface ToggleGroupItemLabelledProps<
  T extends string,
> extends ToggleGroupItemCommonProps<T> {
  /** The visible label. Defaults to the `value` itself; pass children for anything richer. */
  children?: React.ReactNode;
  /**
   * Icon before the label — a bare glyph, an explicit `<Icon>`, or a render
   * function. Inherits the segment's text colour.
   */
  startIcon?: IconSlot<ButtonIconState>;
  /** Icon after the label — same forms as `startIcon`. Inherits the segment's text colour. */
  endIcon?: IconSlot<ButtonIconState>;
  /**
   * Unsupported on a labelled segment — pass `startIcon`/`endIcon` instead.
   * `icon` is the discriminant of the icon-only arm ({@link ToggleGroupItemIconOnlyProps}).
   */
  icon?: never;
  /**
   * An authored accessible name, for when `children`'s flattened text would name
   * the segment misleadingly (e.g. a label plus a trailing count `Badge`). Must
   * still contain the visible label text (WCAG 2.5.3 *Label in Name*). Leave it
   * off when `children` already reads correctly. Required on the icon-only arm.
   */
  "aria-label"?: string;
}

/**
 * The icon-only segment: a single centred glyph, no visible label — the mirror
 * of `Button`'s icon-only arm. `icon` replaces the label and is the union
 * discriminant, so `aria-label` becomes **required** as the only accessible name.
 */
export interface ToggleGroupItemIconOnlyProps<
  T extends string,
> extends ToggleGroupItemCommonProps<T> {
  /**
   * The single centred glyph — **required**, and the discriminant of this arm.
   * Typed `NonNullable` so a nullish value (e.g. `cond ? <Icon/> : null`) can't
   * slip through and render an *unnamed* segment.
   */
  icon: NonNullable<IconSlot<ButtonIconState>>;
  /**
   * Accessible name — **required**, since the icon-only segment has no visible
   * text to name it. On a labelled segment, the same prop is optional.
   */
  "aria-label": string;
  /** Unsupported on the icon-only arm — the `icon` slot is the whole content. */
  children?: never;
  /** Unsupported on the icon-only arm — the `icon` slot is the whole content. */
  startIcon?: never;
  /** Unsupported on the icon-only arm — the `icon` slot is the whole content. */
  endIcon?: never;
}

/**
 * One segment's props, discriminated on the presence of `icon` — mirroring
 * `Button`: labelled ({@link ToggleGroupItemLabelledProps}) or icon-only
 * ({@link ToggleGroupItemIconOnlyProps}).
 */
export type ToggleGroupItemProps<T extends string> =
  | ToggleGroupItemLabelledProps<T>
  | ToggleGroupItemIconOnlyProps<T>;

/**
 * One segment, rendered as the same `InternalButton` that powers `Button`. Its
 * on/off look comes from the shared colour recipe: selected takes the group's
 * `intent` x `saliency`, unselected drops to neutral `low` (ghost).
 *
 * Stable module-level component (not re-created per render) so React reconciles
 * normally; type-narrowing to `T` happens where the group hands it to the render-prop.
 */
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

  // `icon` is the union discriminant. The `!= null` test mirrors
  // `InternalButton`'s own icon-only check, so a nullish `icon` never renders as
  // an unnamed square.
  const consumerProps: ButtonProps =
    props.icon != null
      ? {
          ...colour,
          icon: props.icon,
          // Icon-only: `aria-label` is the accessible name; `InternalButton`
          // forwards it only on the icon-only arm.
          "aria-label": props["aria-label"],
        }
      : {
          ...colour,
          // Labelled: default the visible label to the `value` (handy for enums).
          children: props.children ?? value,
          startIcon: props.startIcon,
          endIcon: props.endIcon,
        };

  // A labelled segment's authored `aria-label` can't ride `consumerProps` (typed
  // `never` there), so it rides the `htmlAttrs` seam instead, merged under the
  // button's own props. The icon-only arm already carries it above.
  const labelledAriaLabel = props.icon == null ? props["aria-label"] : undefined;

  return (
    <Toggle
      value={value}
      // base-ui's `Toggle` computes its props (aria-pressed, onClick, roving
      // tabIndex) and hands them through the `htmlAttrs` seam, so the rendered
      // element stays a real `<button>` with no extra wrapper.
      render={(toggleProps) => (
        <InternalButton
          consumerProps={consumerProps}
          htmlAttrs={
            // The active-tab-stop marker and a labelled segment's `aria-label`
            // ride this seam; data-* isn't statically known on base-ui's props,
            // hence the cast.
            {
              ...toggleProps,
              // Carries the active-tab-stop marker, so Tab focuses this segment.
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
  /**
   * Render-prop children. Receives a `ToggleGroupItem` already bound to this
   * group's `T`, so every `<ToggleGroupItem value={...} />` is type-checked
   * against the group's value type.
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
   * Lay the segments out in a row (`horizontal`, default) or a column
   * (`vertical`). Drives both the paint (flex direction) and the keyboard axis:
   * Left/Right in a horizontal group, Up/Down in a vertical one. A vertical
   * group stretches its segments to a shared width; pair with `width="fill"` to
   * span a fixed-width container.
   */
  orientation?: ToggleGroupOrientation;
  /**
   * Make the group span its container instead of shrink-wrapping its segments.
   * `"fill"` applies the shared `full` width atom and flips the wrapping `Field`
   * to `fit: "fill"`, so the fill isn't swallowed by the field's shrink-wrap.
   *
   * Only `"fill"` is offered — the `Field` wrapper blocks `inherit` from
   * reaching an ancestor's width, and `fit` would just restate the default.
   */
  width?: "fill";
  /**
   * Disable the whole group. Modelled with `aria-disabled` + a veto in the
   * change handler (never the native attribute), so segments stay keyboard
   * reachable but the value can't change.
   */
  disabled?: boolean;
  /** Inline help shown under the group and wired via `aria-describedby`. */
  helpText?: React.ReactNode;
  /**
   * Validation state. `invalid` flags `aria-invalid` and reddens `helpText`;
   * segment colours still come from `intent`/`saliency`. Default `neutral`.
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
 * selected: `null` is not assignable and re-pressing the active segment can't
 * clear it, so `onChange` only ever emits a real `T`.
 */
interface ToggleGroupStrictProps<T extends string> {
  /** The currently selected value (controlled). Always exactly one. */
  value: T;
  /**
   * Called with the newly selected value, then the raw DOM event that drove it.
   * Not called when the group is disabled.
   */
  onChange: (value: T, event: Event) => void;
  /** Off (or omitted): the group is strictly single-select. See {@link ToggleGroupClearableProps}. */
  clearable?: false;
}

/**
 * The opt-in clearable arm. `value` also accepts `null` (nothing selected), and
 * re-pressing the active segment clears the selection, so `onChange` can emit
 * `null` too.
 */
interface ToggleGroupClearableProps<T extends string> {
  /** The currently selected value (controlled), or `null` for nothing selected. */
  value: T | null;
  /**
   * Called with the newly selected value (or `null` when the active segment is
   * re-pressed), then the raw DOM event. Not called when the group is disabled.
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
 * Named by exactly one of `label` / `aria-label` / `aria-labelledby` (mutually
 * exclusive). A visible `label` flips the control into form-control semantics;
 * a bare toolbar names itself with `aria-label`.
 *
 * `value`/`onChange` is discriminated by `clearable`: omitted (or `false`) keeps
 * the strict single-select contract; `clearable` widens both to accept `null`.
 *
 * The component is *overloaded* on these two arms rather than typed by this
 * union, because a union of two generic shapes defeats `T` inference — overloads
 * let each arm infer `T` on its own, so consumers never spell out `<ToggleGroup<T>>`.
 */
export type ToggleGroupProps<T extends string> =
  | ToggleGroupStrictFullProps<T>
  | ToggleGroupClearableFullProps<T>;

/**
 * ToggleGroup — a single-select segmented control: a row of toggle buttons
 * where exactly one is selected, built on base-ui's `ToggleGroup` / `Toggle`
 * and rendered with the same `InternalButton` as `Button`.
 *
 * Like `RadioGroup`, it's a **type-safe compound component**: the group is
 * generic over the value type `T` (inferred from `value`), and hands the
 * render-prop a `ToggleGroupItem` bound to that `T`. `T` is constrained to
 * `string` since base-ui keys toggles by string.
 * See https://tkdodo.eu/blog/building-type-safe-compound-components
 *
 * **Keyboard** (a toolbar-style roving tab stop, not a radio group — selection
 * is manual): Tab lands on the *selected* segment; arrow keys move focus
 * without selecting; Enter/Space selects the focused segment. The arrow axis
 * follows `orientation`. While `disabled`, everything still works except the
 * final selection.
 *
 * Lay segments out in a row (`orientation="horizontal"`, default) or a column
 * (`orientation="vertical"`). Pair a vertical group with `width="fill"` to
 * span a fixed-width container, which also fills the wrapping `Field` in
 * form-control mode.
 *
 * It doubles as a **labelled form control**: pass `label` (plus optional
 * `helpText`, `state`, or `required`) for field semantics, while keeping the
 * same toolbar look.
 *
 * By default exactly one segment is always selected. Opt into an empty state
 * with `clearable`: `value` then also accepts `null`, and re-pressing the
 * active segment clears the selection.
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
 * // Vertical: a stacked control filling a fixed-width sidebar via width="fill".
 * const [tool, setTool] = React.useState<Tool>("select");
 * <ToggleGroup
 *   aria-label="Annotation tool"
 *   orientation="vertical"
 *   width="fill"
 *   value={tool}
 *   onChange={setTool}
 * >
 *   {({ ToggleGroupItem }) => (
 *     <>
 *       <ToggleGroupItem value="select">Select</ToggleGroupItem>
 *       <ToggleGroupItem value="draw">Draw</ToggleGroupItem>
 *       <ToggleGroupItem value="erase">Erase</ToggleGroupItem>
 *     </>
 *   )}
 * </ToggleGroup>
 *
 * @example
 * // Icons: `startIcon`/`endIcon` flank a label; `icon` + `aria-label` is icon-only.
 * <ToggleGroup aria-label="Analyse by" value={mode} onChange={setMode}>
 *   {({ ToggleGroupItem }) => (
 *     <>
 *       <ToggleGroupItem value="rhyme" startIcon={<Icon><Music /></Icon>}>Rhyme</ToggleGroupItem>
 *       <ToggleGroupItem value="meter" startIcon={<Icon><Ruler /></Icon>}>Meter</ToggleGroupItem>
 *       <ToggleGroupItem value="grid" aria-label="Grid" icon={<Icon><Grid /></Icon>} />
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
    // Internally widened to `T | null` (the clearable arm) and narrowed at the call site.
  } = props as ToggleGroupClearableProps<T> & ToggleGroupSharedProps<T> & FieldLabellingInput;

  const invalid = state === "invalid";
  // see `useIsFieldDisabled`
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;
  const nameProps: FieldLabellingInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  };
  // base-ui's group value is an array (it supports multi-select); single-select
  // is a one-element array, empty when cleared. Memoised for referential stability.
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
      // Shrink-wrap the segmented row by default, but when asked to `fill`, the
      // `Field` must span too or the group's `width: 100%` fills only itself.
      fit={width === "fill" ? "fill" : "content"}
      disabled={disabled}
      slotProps={slotProps}
    >
      {/*
        base-ui's toolbar isn't a field control, so the naming/description
        wiring comes from the render prop, not field context.
      */}
      {({ nameAttrs, describedBy }) => (
        <ToggleGroupItemContext.Provider value={itemContext}>
          <BaseToggleGroup
            ref={ref}
            value={groupValue}
            // Wires the keyboard to match the paint: base-ui reads this to choose
            // the roving-focus axis (Up/Down vertical, Left/Right horizontal).
            // Exposed as `data-orientation`; `role="group"` has no `aria-orientation`.
            orientation={orientation}
            onValueChange={(next, details) => {
              // Veto every change when disabled. base-ui shares `details` with the
              // toggle, so `cancel()` stops the value changing (no flicker).
              if (disabled) {
                details.cancel();
                return;
              }
              // Re-pressing the active segment clears it (base-ui reports an empty
              // array). Real change to `null` when `clearable`; otherwise vetoed.
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
            // `aria-disabled` + the veto above, NOT base-ui's `disabled` (which would
            // drop the group from the tab order and stop arrow navigation). Keeps a
            // disabled group fully Tab/arrow reachable — see AGENTS.md.
            aria-disabled={disabled || undefined}
            className={cx(
              toggleGroupRoot({ orientation }),
              // Width comes from the shared shorthand resolver (the same source
              // `Box`/`Flex`/`Button` use), so it never drifts. `resolveWidth(undefined)`
              // is a no-op, so the unset default stays shrink-wrap.
              atoms({ width: resolveWidth(width) }),
              // A filled horizontal toolbar grows its segments to share the width;
              // a vertical column already shares it via `align-items: stretch`.
              orientation === "horizontal" && width === "fill" && toggleGroupFillRow,
              disabled && toggleGroupDisabled,
              className,
            )}
          >
            {children({
              // Stable generic item narrowed to this group's `T`; the cast is
              // type-level only — the runtime function is the same.
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
