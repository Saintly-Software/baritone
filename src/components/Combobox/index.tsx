"use client";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Field } from "@base-ui/react/field";
import * as React from "react";
import { InternalSpinner } from "../../internal/components/InternalSpinner";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { surfaceRecipe } from "../../styles/recipes/surface.css";
import { textIntentRecipe, textVariantRecipe } from "../../styles/recipes/text.css";
import type { FormState, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { useIsFieldDisabled } from "../Fieldset";
import {
  adornment,
  chip,
  chipLabel,
  chipRemove,
  chipsContainer,
  control,
  createPrefix,
  input,
  item as itemClass,
  itemIndicator,
  itemLabel,
  list,
  popup,
  positioner,
  status as statusClass,
  statusError,
  statusSpinner,
  virtualItem,
  virtualSizer,
  virtualViewport,
  wrapper,
} from "./combobox.css";

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

/** A single choice. `value` is what the form submits and `onValueChange` reports; `label` is what's shown. */
export interface ComboboxOption {
  value: string;
  label: string;
  /** Renders the option but blocks selection (kept visible, `aria-disabled`). */
  disabled?: boolean;
}

/** Internal shape — the free-text "Add …" affordance is a synthetic option flagged with `create`. */
interface InternalOption extends ComboboxOption {
  create?: boolean;
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
  /** The current async results to render. */
  results?: ComboboxOption[];
  /** Called with the query on each input change. Debounce / abort in here. */
  onSearch?: (query: string) => void;
}

interface ComboboxBaseProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "value" | "defaultValue" | "onChange" | "children" | "prefix"
> {
  /** The choices (sync mode). In async mode, provide `search.results` instead. */
  options?: ComboboxOption[];
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Shown (and announced) when `state` is `invalid`. */
  errorMessage?: React.ReactNode;
  /** Validation state. `invalid` maps to negative, `valid` to positive. */
  state?: FormState;
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

export type ComboboxProps = ComboboxBaseProps & (ComboboxSingleProps | ComboboxMultipleProps);

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
 * Like the other form controls it takes a `state` (not intent/saliency), wires
 * its label / description / error through base-ui's `Field`, and models disabled
 * with `aria-disabled` + `readOnly` so it stays keyboard-focusable.
 */
export function Combobox(props: ComboboxProps) {
  const {
    options,
    label,
    description,
    errorMessage,
    state = "neutral",
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
  } = props;

  // A wrapping `Fieldset` can disable the whole group; OR it into the local prop.
  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;

  // Value <-> option registry. Public values are strings; base-ui items are the
  // option objects. We remember every option we've seen (props + async results +
  // selections) so a selected value's label still resolves after the async list
  // has moved on. Populating during render is idempotent and safe.
  const cacheRef = React.useRef<Map<string, ComboboxOption>>(new Map());
  for (const o of options ?? []) cacheRef.current.set(o.value, o);
  for (const o of search?.results ?? []) cacheRef.current.set(o.value, o);
  const toOption = React.useCallback(
    (v: string): ComboboxOption => cacheRef.current.get(v) ?? { value: v, label: v },
    [],
  );

  const [query, setQuery] = React.useState("");

  const isAsync = search != null;
  const baseItems: ComboboxOption[] = isAsync ? (search.results ?? []) : (options ?? []);

  // Free-text "Add …" affordance: a synthetic option for the current query when
  // it doesn't already match a known option (by label or value).
  const trimmed = query.trim();
  const hasExactMatch = baseItems.some(
    (o) => o.label.toLowerCase() === trimmed.toLowerCase() || o.value === trimmed,
  );
  const items: InternalOption[] =
    freeText && trimmed !== "" && !hasExactMatch
      ? [...baseItems, { value: trimmed, label: trimmed, create: true }]
      : baseItems;

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

  const inputEl = (
    <BaseCombobox.Input
      ref={ref}
      id={id}
      className={input}
      placeholder={placeholder}
      aria-disabled={disabled || undefined}
      readOnly={disabled || readOnly}
      {...rest}
    />
  );

  return (
    <Field.Root className={wrapper} invalid={state === "invalid"}>
      {label != null && <Field.Label className={labelClass}>{label}</Field.Label>}
      <BaseCombobox.Root
        items={items}
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
          <BaseCombobox.Positioner className={positioner} sideOffset={4}>
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
              ) : (
                <BaseCombobox.List className={list}>
                  {(option: InternalOption) => renderOption(option)}
                </BaseCombobox.List>
              )}
            </BaseCombobox.Popup>
          </BaseCombobox.Positioner>
        </BaseCombobox.Portal>
      </BaseCombobox.Root>
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
