"use client";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import * as React from "react";
import { InternalSpinner } from "../../internal/components/InternalSpinner";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { surfaceRecipe } from "../../styles/recipes/surface.css";
import type { FormState, LabelPosition, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import {
  Field,
  type FieldLabellingInput,
  type FieldLabellingProps,
  fieldNameAttrs,
  type FieldSlotProps,
} from "../Field";
import { useIsFieldDisabled } from "../Fieldset";
import {
  adornment,
  chip,
  chipLabel,
  chipRemove,
  chipsContainer,
  control,
  createPrefix,
  group as groupClass,
  groupLabel as groupLabelClass,
  input,
  item as itemClass,
  itemIndicator,
  itemLabel,
  list,
  popup,
  status as statusClass,
  statusError,
  statusSpinner,
  virtualItem,
  virtualSizer,
  virtualViewport,
} from "./combobox.css";

/** A single choice. `value` is what the form submits and `onValueChange` reports; `label` is what's shown. */
export interface ComboboxOption {
  value: string;
  label: string;
  /** Renders the option but blocks selection (kept visible, `aria-disabled`). */
  disabled?: boolean;
}

/** A titled group of options, rendered under a heading in the popup. */
export interface ComboboxOptionGroup {
  /** The group heading, shown above the options and associated as their label. */
  label: string;
  /** The options within this group. */
  options: ComboboxOption[];
}

/** Internal shape — the free-text "Add …" affordance is a synthetic option flagged with `create`. */
interface InternalOption extends ComboboxOption {
  create?: boolean;
}

/** base-ui's group shape (`items`, not `options`); `label` drives the heading. */
interface InternalGroup {
  label?: string;
  items: InternalOption[];
}

/** `options` / `search.results` accept a flat list or an array of groups; this narrows which. */
function isGrouped(
  items: readonly ComboboxOption[] | readonly ComboboxOptionGroup[],
): items is readonly ComboboxOptionGroup[] {
  const first = items[0];
  return first != null && "options" in first;
}

/** Flatten a (possibly grouped, possibly absent) source into a single option list. */
function flattenOptions(
  src: readonly ComboboxOption[] | readonly ComboboxOptionGroup[] | undefined,
): ComboboxOption[] {
  if (src == null) return [];
  return isGrouped(src) ? src.flatMap((g) => g.options) : (src as ComboboxOption[]);
}

/** Copy for the async popup states. Each falls back to a sensible default. */
export interface ComboboxSearchCopy {
  /** Shown beside the spinner while `loading`. Default `"Searching…"`. */
  loading?: React.ReactNode;
  /** Shown when the (filtered) list is empty. Default `"No results found."`. */
  empty?: React.ReactNode;
  /** Shown when `error` is set. Defaults to the `error` string itself. */
  error?: React.ReactNode;
}

/**
 * Async search configuration. Presence of this object switches the Combobox into
 * async mode: internal filtering is disabled, `results` drive the list, and the
 * popup shows a spinner / error / empty state. `onSearch` is called with the
 * current query on every input change — debounce and wire up an `AbortController`
 * in your handler.
 */
export interface ComboboxSearch {
  /** Show the loading (spinner) state in the popup. */
  loading?: boolean;
  /** An error message to show in the popup. */
  error?: string;
  /** Override the default loading / empty / error copy. */
  copy?: ComboboxSearchCopy;
  /** The current async results to render. Pass groups to render them under headings. */
  results?: ComboboxOption[] | ComboboxOptionGroup[];
  /** Called with the query on each input change. Debounce / abort in here. */
  onSearch?: (query: string) => void;
}

interface ComboboxBaseProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  | "size"
  | "value"
  | "defaultValue"
  | "onChange"
  | "children"
  | "prefix"
  | "aria-label"
  | "aria-labelledby"
> {
  /**
   * The choices (sync mode). In async mode, provide `search.results` instead.
   * Pass an array of `{ label, options }` groups to render options under headings
   * (ignored — flattened — when `virtualized`).
   */
  options?: ComboboxOption[] | ComboboxOptionGroup[];
  /** Inline help under the control, wired to its `aria-describedby`. */
  helpText?: React.ReactNode;
  /** Validation state. `invalid` maps to negative, `valid` to positive. */
  state?: FormState;
  /** Where the label sits. `top` (default) stacks it above; `start`/`end` inline it. */
  labelPosition?: LabelPosition;
  /** Per-slot overrides for the label / help-text pieces. */
  slotProps?: FieldSlotProps;
  /** Control size. Default `md`. */
  size?: Size;
  placeholder?: string;
  /** Uses `aria-disabled` + `readOnly` (keeps the field keyboard-focusable). */
  disabled?: boolean;
  required?: boolean;
  /** Form field name — submits the option `value`(s). */
  name?: string;
  /** Hide the inline clear (✕) button. */
  hideClearButton?: boolean;
  /** Allow committing values that aren't in the list (an "Add …" row appears). */
  freeText?: boolean;
  /** Window long lists (only the visible rows are mounted). */
  virtualized?: boolean;
  /** Async search config — see {@link ComboboxSearch}. */
  search?: ComboboxSearch;
  /** Accessible label for the clear button. Default `"Clear"`. */
  clearLabel?: string;
  /** Accessible label for the open/close trigger. Default `"Show options"`. */
  triggerLabel?: string;
  className?: string;
  ref?: React.Ref<HTMLInputElement>;
}

interface ComboboxSingleProps {
  multiple?: false;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}

interface ComboboxMultipleProps {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

/**
 * Named by exactly one of `label` / `aria-label` / `aria-labelledby` — they're
 * mutually exclusive (see `FieldLabellingProps`).
 */
export type ComboboxProps = ComboboxBaseProps &
  (ComboboxSingleProps | ComboboxMultipleProps) &
  FieldLabellingProps;

// Rough per-row height (px) for the virtualized window — matches the item's
// vertical padding + line box. Rows are given this exact height when virtualized.
const VIRTUAL_ITEM_HEIGHT = 40;
const VIRTUAL_VIEWPORT_HEIGHT = 280;
const VIRTUAL_OVERSCAN = 6;

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" fill="none" aria-hidden>
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1.1em" height="1.1em" fill="none" aria-hidden>
      <path
        d="m5 13 4 4L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Combobox — a typeahead / autocomplete "form control" built on base-ui's
 * `Combobox`. Single or multiple selection (discriminated on `multiple`), with a
 * string `value` / `onValueChange` shape. Supports synchronous options,
 * async search (spinner / empty / error states in the popup), free-text entry,
 * and windowed virtualization for long lists.
 *
 * Like the other form controls it takes a `state` (not intent/saliency), composes
 * `Field` for its label / help / error layout and ARIA wiring, and models disabled
 * with `aria-disabled` + `readOnly` so it stays keyboard-focusable.
 */
export function Combobox(props: ComboboxProps) {
  const {
    options,
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    helpText,
    state = "neutral",
    labelPosition = "top",
    slotProps,
    size = "md",
    placeholder,
    disabled: disabledProp,
    required,
    name,
    hideClearButton,
    freeText,
    virtualized,
    search,
    clearLabel = "Clear",
    triggerLabel = "Show options",
    className,
    multiple,
    value,
    defaultValue,
    onValueChange,
    readOnly,
    id,
    ref,
    ...rest
  } = props as ComboboxBaseProps &
    FieldLabellingInput & {
      multiple?: boolean;
      value?: unknown;
      defaultValue?: unknown;
      onValueChange?: unknown;
      ref?: React.Ref<HTMLInputElement>;
    };

  // A wrapping `Fieldset` can disable the whole group; OR it into the local prop.
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;
  const nameProps: FieldLabellingInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  };

  // Value <-> option registry. Public values are strings; base-ui items are the
  // option objects. We remember every option we've seen (props + async results +
  // selections) so a selected value's label still resolves after the async list
  // has moved on. Populating during render is idempotent and safe.
  const cacheRef = React.useRef<Map<string, ComboboxOption>>(new Map());
  for (const o of flattenOptions(options)) cacheRef.current.set(o.value, o);
  for (const o of flattenOptions(search?.results)) cacheRef.current.set(o.value, o);
  const toOption = React.useCallback(
    (v: string): ComboboxOption => cacheRef.current.get(v) ?? { value: v, label: v },
    [],
  );

  const [query, setQuery] = React.useState("");

  const isAsync = search != null;
  // The active source — flat or grouped, sync `options` or async `search.results`.
  const source: readonly ComboboxOption[] | readonly ComboboxOptionGroup[] = isAsync
    ? (search.results ?? [])
    : (options ?? []);
  // Groups are supported everywhere except the virtualized window, whose row math
  // assumes a flat list — there, a grouped source is flattened and headings drop.
  const useGroups = !virtualized && isGrouped(source);
  const flatOptions = flattenOptions(source);

  // Free-text "Add …" affordance: a synthetic option for the current query when
  // it doesn't already match a known option (by label or value).
  const trimmed = query.trim();
  const hasExactMatch = flatOptions.some(
    (o) => o.label.toLowerCase() === trimmed.toLowerCase() || o.value === trimmed,
  );
  const showCreate = freeText && trimmed !== "" && !hasExactMatch;
  const createOption: InternalOption = { value: trimmed, label: trimmed, create: true };

  // What base-ui receives as `items`: a flat option list, or (when grouping)
  // its `{ label, items }` group shape. The free-text row is appended either as a
  // trailing flat option or as its own headerless group.
  const rootItems: readonly InternalOption[] | readonly InternalGroup[] = useGroups
    ? [
        ...(source as readonly ComboboxOptionGroup[]).map(
          (g): InternalGroup => ({ label: g.label, items: g.options }),
        ),
        ...(showCreate ? [{ items: [createOption] } satisfies InternalGroup] : []),
      ]
    : showCreate
      ? [...flatOptions, createOption]
      : flatOptions;

  const rootValue =
    value === undefined
      ? undefined
      : multiple
        ? (value as string[]).map(toOption)
        : value === null
          ? null
          : toOption(value as string);
  const rootDefaultValue =
    defaultValue === undefined
      ? undefined
      : multiple
        ? (defaultValue as string[]).map(toOption)
        : defaultValue === null
          ? null
          : toOption(defaultValue as string);

  const handleValueChange = React.useCallback(
    (next: ComboboxOption | ComboboxOption[] | null) => {
      if (multiple) {
        const arr = (next as ComboboxOption[]) ?? [];
        for (const o of arr) cacheRef.current.set(o.value, o);
        (onValueChange as ((v: string[]) => void) | undefined)?.(arr.map((o) => o.value));
      } else {
        const o = next as ComboboxOption | null;
        if (o) cacheRef.current.set(o.value, o);
        (onValueChange as ((v: string | null) => void) | undefined)?.(o ? o.value : null);
      }
    },
    [multiple, onValueChange],
  );

  const handleInputValueChange = React.useCallback(
    (next: string) => {
      setQuery(next);
      search?.onSearch?.(next);
    },
    [search],
  );

  const virtualScrollRef = React.useRef<HTMLDivElement>(null);
  const handleItemHighlighted = React.useCallback(
    (_value: unknown, details: { index: number; reason: string }) => {
      const el = virtualScrollRef.current;
      if (!el || details.reason !== "keyboard" || details.index < 0) return;
      const top = details.index * VIRTUAL_ITEM_HEIGHT;
      const bottom = top + VIRTUAL_ITEM_HEIGHT;
      if (top < el.scrollTop) el.scrollTop = top;
      else if (bottom > el.scrollTop + el.clientHeight) el.scrollTop = bottom - el.clientHeight;
    },
    [],
  );

  const copy = {
    loading: search?.copy?.loading ?? "Searching…",
    empty: search?.copy?.empty ?? "No results found.",
    error: search?.copy?.error ?? search?.error,
  };
  const busy = isAsync && (search.loading || search.error != null);

  const renderOption = (option: InternalOption, index?: number) => (
    <BaseCombobox.Item
      key={option.value}
      value={option}
      // Options are listbox rows, never tab stops (the input keeps focus and they
      // are navigated by roving highlight), so base-ui's `disabled` correctly sets
      // `aria-disabled` here without harming focusability — see the allowlist note
      // in aria-disabled-convention.test.ts.
      disabled={option.disabled}
      index={index}
      className={index === undefined ? itemClass : cx(itemClass, virtualItem)}
      style={
        index === undefined
          ? undefined
          : { top: index * VIRTUAL_ITEM_HEIGHT, height: VIRTUAL_ITEM_HEIGHT }
      }
    >
      <span className={itemLabel}>
        {option.create ? (
          <>
            <span className={createPrefix}>Add </span>“{option.label}”
          </>
        ) : (
          option.label
        )}
      </span>
      <BaseCombobox.ItemIndicator className={itemIndicator} render={<CheckIcon />} />
    </BaseCombobox.Item>
  );

  // A group section: a heading (base-ui associates it with the group) followed by
  // a `Collection` that renders the group's filtered items. The headerless group
  // carrying the free-text "Add …" row has no `label`, so no heading is shown.
  const renderGroup = (grp: InternalGroup) => (
    <BaseCombobox.Group key={grp.label ?? "__create"} items={grp.items} className={groupClass}>
      {grp.label != null && (
        <BaseCombobox.GroupLabel className={groupLabelClass}>{grp.label}</BaseCombobox.GroupLabel>
      )}
      <BaseCombobox.Collection>
        {(option: InternalOption) => renderOption(option)}
      </BaseCombobox.Collection>
    </BaseCombobox.Group>
  );

  const inputEl = (
    <BaseCombobox.Input
      ref={ref}
      id={id}
      className={input}
      placeholder={placeholder}
      aria-disabled={disabled || undefined}
      readOnly={disabled || readOnly}
      // base-ui's `Field.Label` already names the input, so this only emits an
      // attribute for the label-less arms.
      {...fieldNameAttrs(nameProps)}
      {...rest}
    />
  );

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
      <BaseCombobox.Root
        items={rootItems as never}
        multiple={multiple}
        value={rootValue as never}
        defaultValue={rootDefaultValue as never}
        onValueChange={handleValueChange as never}
        onInputValueChange={handleInputValueChange}
        isItemEqualToValue={(a: ComboboxOption, b: ComboboxOption) => a?.value === b?.value}
        itemToStringLabel={(o: ComboboxOption) => o.label}
        itemToStringValue={(o: ComboboxOption) => o.value}
        filter={isAsync ? null : undefined}
        virtualized={virtualized || undefined}
        onItemHighlighted={virtualized ? handleItemHighlighted : undefined}
        name={name}
        required={required}
        readOnly={disabled || readOnly}
        openOnInputClick={!disabled}
      >
        <BaseCombobox.InputGroup
          className={cx(
            control({ state, size, layout: multiple ? "multiple" : "single" }),
            focusRingRecipe({ type: "within", offset: "sm" }),
            className,
          )}
          aria-disabled={disabled || undefined}
        >
          {multiple ? (
            <BaseCombobox.Chips className={chipsContainer}>
              <BaseCombobox.Value>
                {(selected: ComboboxOption[]) => (
                  <>
                    {selected.map((o) => (
                      <BaseCombobox.Chip key={o.value} className={chip}>
                        <span className={chipLabel}>{o.label}</span>
                        <BaseCombobox.ChipRemove
                          className={chipRemove}
                          aria-label={`Remove ${o.label}`}
                        >
                          <XIcon />
                        </BaseCombobox.ChipRemove>
                      </BaseCombobox.Chip>
                    ))}
                    {inputEl}
                  </>
                )}
              </BaseCombobox.Value>
            </BaseCombobox.Chips>
          ) : (
            inputEl
          )}
          {!hideClearButton && (
            <BaseCombobox.Clear className={adornment} aria-label={clearLabel}>
              <XIcon />
            </BaseCombobox.Clear>
          )}
          <BaseCombobox.Trigger
            className={adornment}
            aria-label={triggerLabel}
            tabIndex={-1}
            aria-disabled={disabled || undefined}
          >
            <ChevronIcon />
          </BaseCombobox.Trigger>
        </BaseCombobox.InputGroup>

        <BaseCombobox.Portal>
          <BaseCombobox.Positioner sideOffset={4}>
            <BaseCombobox.Popup
              className={cx(
                surfaceRecipe({ intent: "neutral", saliency: "low", padding: "none" }),
                popup,
              )}
              aria-busy={busy || undefined}
            >
              {isAsync && (search.loading || search.error != null) && (
                <BaseCombobox.Status
                  className={cx(statusClass, search.error != null && statusError)}
                >
                  {search.loading ? (
                    <>
                      <InternalSpinner className={statusSpinner} />
                      {copy.loading}
                    </>
                  ) : (
                    copy.error
                  )}
                </BaseCombobox.Status>
              )}
              {!busy && (
                <BaseCombobox.Empty className={statusClass}>{copy.empty}</BaseCombobox.Empty>
              )}
              {virtualized ? (
                <BaseCombobox.List className={list}>
                  <VirtualList scrollRef={virtualScrollRef} renderOption={renderOption} />
                </BaseCombobox.List>
              ) : useGroups ? (
                <BaseCombobox.List className={list}>
                  {(grp: InternalGroup) => renderGroup(grp)}
                </BaseCombobox.List>
              ) : (
                <BaseCombobox.List className={list}>
                  {(option: InternalOption) => renderOption(option)}
                </BaseCombobox.List>
              )}
            </BaseCombobox.Popup>
          </BaseCombobox.Positioner>
        </BaseCombobox.Portal>
      </BaseCombobox.Root>
    </Field>
  );
}

interface VirtualListProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  renderOption: (option: InternalOption, index: number) => React.ReactNode;
}

/**
 * The windowed list body for `virtualized`. Reads the currently filtered items
 * from base-ui and renders only the rows in (and just around) the scroll
 * viewport, each absolutely positioned by its index — so a list of thousands
 * mounts a handful of nodes. Keyboard highlight scrolling is handled by the
 * parent via `scrollRef` + `onItemHighlighted`.
 */
function VirtualList({ scrollRef, renderOption }: VirtualListProps) {
  const filtered = BaseCombobox.useFilteredItems<InternalOption>();
  const [scrollTop, setScrollTop] = React.useState(0);

  const total = filtered.length;
  const startIndex = Math.max(0, Math.floor(scrollTop / VIRTUAL_ITEM_HEIGHT) - VIRTUAL_OVERSCAN);
  const endIndex = Math.min(
    total,
    Math.ceil((scrollTop + VIRTUAL_VIEWPORT_HEIGHT) / VIRTUAL_ITEM_HEIGHT) + VIRTUAL_OVERSCAN,
  );

  const rows: React.ReactNode[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    const option = filtered[i];
    if (option) rows.push(renderOption(option, i));
  }

  return (
    <div
      ref={scrollRef}
      className={virtualViewport}
      style={{ height: VIRTUAL_VIEWPORT_HEIGHT }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div className={virtualSizer} style={{ height: total * VIRTUAL_ITEM_HEIGHT }}>
        {rows}
      </div>
    </div>
  );
}

Combobox.displayName = "Combobox";
