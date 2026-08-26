"use client";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import * as React from "react";
import type { ButtonProps } from "../Button";
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

/**
 * Props shared by *both* `ToggleGroupItem` arms — the labelled look and the
 * icon-only one. Deliberately silent on `children`/`icon`/`startIcon`/`endIcon`/
 * `aria-label`: those differ between a labelled segment (its visible text is the
 * accessible name) and an icon-only one (a required `aria-label` is), so each arm
 * redefines them. Mirrors `Button`'s `ButtonCommonProps` split.
 */
interface ToggleGroupItemCommonProps<T extends string> {
  /**
   * The value this segment selects. Constrained to the group's `T`, so a typo or
   * a value outside the union/enum is a compile error.
   */
  value: T;
  /** Extra className merged onto the segment's `<button>`. */
  className?: string;
}

/**
 * The labelled segment (the default arm): a visible text label, optionally
 * flanked by icons. Mirrors `Button`'s labelled arm — `startIcon`/`endIcon` sit
 * before/after the label in a slot `InternalButton` lays out, so the icon/label
 * gap and vertical alignment are owned once by the design system rather than by
 * each caller's `children` composition. `icon` is absent here (its presence is
 * what selects the icon-only arm).
 */
export interface ToggleGroupItemLabelledProps<
  T extends string,
> extends ToggleGroupItemCommonProps<T> {
  /**
   * The visible label. Defaults to the `value` itself (handy for string enums);
   * pass children for anything richer.
   */
  children?: React.ReactNode;
  /** Icon before the label. Typically an `<Icon>`; inherits the segment's text colour. */
  startIcon?: React.ReactNode;
  /** Icon after the label. Typically an `<Icon>`; inherits the segment's text colour. */
  endIcon?: React.ReactNode;
  /**
   * Unsupported on a labelled segment — pass `startIcon`/`endIcon` alongside the
   * label instead. `icon` is the discriminant of the icon-only arm
   * ({@link ToggleGroupItemIconOnlyProps}), which drops the visible label.
   */
  icon?: never;
  /**
   * An authored accessible name for the segment, for when the flattened text of
   * `children` would name it misleadingly — e.g. a label paired with a trailing
   * count `Badge` ("Comments" + "3" would otherwise announce as "Comments 3").
   * When set, it becomes the segment's whole accessible name, so it must still
   * contain the visible label text (WCAG 2.5.3 *Label in Name*). Leave it off
   * when `children` already reads correctly (the common case). It's *required* on
   * the icon-only arm ({@link ToggleGroupItemIconOnlyProps}), which has no visible
   * text to name it.
   */
  "aria-label"?: string;
}

/**
 * The icon-only segment: a single centred glyph, no visible label — the mirror of
 * `Button`'s icon-only arm ({@link IconButtonProps}). `icon` replaces the label
 * (and is the union discriminant), so `aria-label` becomes **required**: it's the
 * segment's only accessible name, exactly as on an icon-only `Button`.
 */
export interface ToggleGroupItemIconOnlyProps<
  T extends string,
> extends ToggleGroupItemCommonProps<T> {
  /**
   * The single centred glyph — **required**, and the discriminant of this arm.
   * Typically an `<Icon>`; inherits the segment's text colour. Typed
   * `NonNullable<React.ReactNode>` so a nullish value (e.g. a `cond ? <Icon/> :
   * null`) can't slip through as the icon-only arm and render an *unnamed* segment
   * — the required `aria-label` is only wired up when a glyph is actually present.
   */
  icon: NonNullable<React.ReactNode>;
  /**
   * Accessible name — **required**, because the segment is icon-only and has no
   * visible text to name it (e.g. "Rhyme scheme"). The mirror of a labelled
   * segment, where the same prop is an optional override of the visible label.
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
 * `Button`: a labelled segment ({@link ToggleGroupItemLabelledProps} — visible
 * text with optional flanking icons) or an icon-only one
 * ({@link ToggleGroupItemIconOnlyProps} — a single glyph named by a required
 * `aria-label`).
 */
export type ToggleGroupItemProps<T extends string> =
  | ToggleGroupItemLabelledProps<T>
  | ToggleGroupItemIconOnlyProps<T>;

/**
 * One segment, rendered as the very same `InternalButton` that powers `Button`.
 * Its on/off look is expressed through the shared `component` colour recipe: the
 * selected segment takes the group's `intent` x `saliency`, an unselected one
 * drops to a neutral `low` (ghost) — so the chosen value reads as a filled block
 * among ghosts, exactly like `ToggleButton`'s pressed/unpressed.
 *
 * Because it *is* an `InternalButton`, it inherits `Button`'s icon vocabulary for
 * free: `startIcon`/`endIcon` flank the label in a slot the button lays out, and
 * `icon` + a required `aria-label` render an icon-only segment (a square glyph) —
 * this renderer just threads the arm's props straight through.
 *
 * Stable module-level component (not re-created per render) so React reconciles
 * it normally; the type-narrowing to `T` happens purely where the group hands it
 * to the render-prop.
 */
function ToggleGroupItem<T extends string>(props: ToggleGroupItemProps<T>) {
  const { value, className } = props;
  const { selectedValue, intent, saliency, size } = React.useContext(ToggleGroupItemContext);
  const selected = value === selectedValue;

  // The on/off look, shared by both arms: the selected segment takes the group's
  // `intent` x `saliency`; an unselected one drops to a neutral `low` (ghost).
  const colour = {
    intent: selected ? intent : "neutral",
    saliency: selected ? saliency : "low",
    size,
    className,
  };

  // `icon` is the union discriminant — its presence selects the icon-only arm.
  // The `!= null` test mirrors `InternalButton`'s own icon-only check, so a
  // nullish `icon` never lands here as an unnamed square. Build the exact `Button`
  // shape for each arm and hand it straight to `InternalButton`, so the segment
  // reuses `Button`'s icon/label layout (slot gap + vertical alignment owned
  // there) rather than re-implementing it via `children`.
  const consumerProps: ButtonProps =
    props.icon != null
      ? {
          ...colour,
          icon: props.icon,
          // Icon-only: the required `aria-label` *is* the accessible name, so it
          // rides `consumerProps` — `InternalButton` forwards `aria-label` only on
          // the icon-only arm (a labelled button's name must be its visible text).
          "aria-label": props["aria-label"],
        }
      : {
          ...colour,
          // Labelled: default the visible label to the `value` (handy for enums).
          children: props.children ?? value,
          startIcon: props.startIcon,
          endIcon: props.endIcon,
        };

  // A *labelled* segment's authored `aria-label` can't ride `consumerProps`: on a
  // labelled button `aria-label` is type-`never` and `InternalButton` drops it
  // (the name there must be the visible label). So it rides the `htmlAttrs` seam,
  // which is merged *under* the button's own props — which never set `aria-label`
  // for a labelled button — letting the authored name survive. The icon-only arm
  // already carries its `aria-label` on `consumerProps` above, so it's excluded.
  const labelledAriaLabel = props.icon == null ? props["aria-label"] : undefined;

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
          consumerProps={consumerProps}
          htmlAttrs={
            // The active-tab-stop marker and a labelled segment's authored
            // `aria-label` ride this seam (see above); data-* isn't statically
            // known on base-ui's props, hence the localized cast (same pattern as
            // the overlay triggers).
            {
              ...toggleProps,
              // The selected segment carries the active-tab-stop marker, so Tab
              // focuses it rather than the first segment.
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
   * against the same union/enum the group's `value` came from. Each item takes
   * `Button`'s icon vocabulary — `startIcon`/`endIcon` around the label, or `icon`
   * + a required `aria-label` for an icon-only segment.
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
   * Lay the segments out in a row (`horizontal`, default — the toolbar) or a
   * column (`vertical` — a stacked segmented control). This drives *both* the
   * paint (flex direction) and the keyboard: base-ui's roving focus follows the
   * same axis, so Left/Right arrow between segments in a horizontal group and
   * Up/Down in a vertical one (selection stays manual — Enter/Space). A vertical
   * group stretches its segments to a shared width; pair it with `width="fill"`
   * to make the whole column span a fixed-width container.
   */
  orientation?: ToggleGroupOrientation;
  /**
   * Make the group span its container instead of shrink-wrapping its segments.
   * Omit (the default) and the group stays `inline-flex`, hugging its content —
   * exactly as before this prop existed. `"fill"` makes it fill the available
   * width: it applies the shared `full` width atom (the same `resolveWidth`
   * source `Box` / `Flex` / `Button` use) *and* flips the wrapping `Field` to
   * `fit: "fill"`, so the fill isn't swallowed by the field's own shrink-wrap.
   * A vertical group in a fixed-width sidebar is the case that wants this; a
   * filled horizontal toolbar grows its segments to share the width.
   *
   * Only `"fill"` is offered (not the full `fit` / `inherit` shorthand `Box` &
   * co. take): the `Field` wrapper interposes as a shrink-wrapper, so `inherit`
   * can't reach an ancestor's width through it and `fit` would only restate the
   * default — both would be dead knobs here.
   */
  width?: "fill";
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
 * (or Space) selects the focused segment. The arrow *axis* follows
 * `orientation` — Left/Right in a horizontal group, Up/Down in a vertical one —
 * because base-ui's roving focus is wired from the same prop. While `disabled`,
 * all of that still works except the final selection — you can explore the
 * group, you just can't change its value.
 *
 * Lay the segments out in a row (`orientation="horizontal"`, the default) or a
 * column (`orientation="vertical"`). A vertical group stretches its segments to a
 * shared width; pair it with `width="fill"` to make the column span a
 * fixed-width container (a sidebar), which also fills the wrapping `Field` in
 * form-control mode.
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
 * // Vertical: a stacked segmented control that fills a fixed-width sidebar.
 * // Up/Down arrow between segments; `width="fill"` spans the container.
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
      // Shrink-wrap around the segmented row (`content`) by default — but when the
      // group is asked to `fill`, the `Field` has to span too, or the group's
      // `width: 100%` would only fill the shrink-wrapped field, not the container.
      fit={width === "fill" ? "fill" : "content"}
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
            // Wire the keyboard to match the paint: base-ui's composite reads this
            // to choose the roving-focus axis, so Up/Down move between segments in a
            // vertical group and Left/Right in a horizontal one. (base-ui exposes it
            // as `data-orientation`; the element is `role="group"`, which — unlike
            // `toolbar`/`radiogroup` — has no `aria-orientation`, so none is set.)
            orientation={orientation}
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
            className={cx(
              toggleGroupRoot({ orientation }),
              // The width property itself comes from the shared shorthand resolver
              // (the single source `Box` / `Flex` / `Button` use), so this never
              // drifts from the other primitives. `resolveWidth(undefined)` is a
              // no-op, so the unset default stays `inline-flex` shrink-wrap.
              atoms({ width: resolveWidth(width) }),
              // A filled horizontal toolbar grows its segments to share the width;
              // a vertical column already shares it via `align-items: stretch`.
              orientation === "horizontal" && width === "fill" && toggleGroupFillRow,
              disabled && toggleGroupDisabled,
              className,
            )}
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
