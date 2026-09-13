"use client";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { assignInlineVars } from "@vanilla-extract/dynamic";
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
import { type IconSlot, renderIcon } from "../Icon/renderIcon";
import {
  adornment,
  chip,
  chipLabel,
  chipRemove,
  chipsContainer,
  colsVar,
  control,
  createPrefix,
  group as groupClass,
  gridItem as gridItemClass,
  gridItemCaption,
  gridItemIcon,
  gridItemIndicator,
  gridItemLabel,
  gridItemSpan,
  gridItemWithIcon,
  gridList,
  gridRow,
  gridSection,
  groupLabel as groupLabelClass,
  input,
  item as itemClass,
  itemIcon,
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

export interface ComboboxOptionIconState {
  disabled: boolean;
}

export interface ComboboxOption {
  value: string;
  label: string;

  icon?: IconSlot<ComboboxOptionIconState>;

  disabled?: boolean;
}

export interface ComboboxOptionGroup {
  label: string;

  options: ComboboxOption[];
}

interface InternalOption extends ComboboxOption {
  create?: boolean;
}

interface InternalGroup {
  label?: string;
  items: InternalOption[];
}

function isGrouped(
  items: readonly ComboboxOption[] | readonly ComboboxOptionGroup[],
): items is readonly ComboboxOptionGroup[] {
  const first = items[0];
  return first != null && "options" in first;
}

function flattenOptions(
  src: readonly ComboboxOption[] | readonly ComboboxOptionGroup[] | undefined,
): ComboboxOption[] {
  if (src == null) return [];
  return isGrouped(src) ? src.flatMap((g) => g.options) : (src as ComboboxOption[]);
}

export interface ComboboxSearchCopy {
  loading?: React.ReactNode;

  empty?: React.ReactNode;

  error?: React.ReactNode;
}

export interface ComboboxSearch {
  loading?: boolean;

  error?: string;

  copy?: ComboboxSearchCopy;

  results?: ComboboxOption[] | ComboboxOptionGroup[];

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
  options?: ComboboxOption[] | ComboboxOptionGroup[];

  helpText?: React.ReactNode;

  state?: FormState;

  labelPosition?: LabelPosition;

  slotProps?: FieldSlotProps;

  size?: Size;
  placeholder?: string;

  disabled?: boolean;
  required?: boolean;

  name?: string;

  hideClearButton?: boolean;

  freeText?: boolean;

  columns?: number;

  virtualized?: boolean;

  search?: ComboboxSearch;

  clearLabel?: string;

  triggerLabel?: string;
  className?: string;
  ref?: React.Ref<HTMLInputElement>;
}

interface ComboboxSingleProps {
  multiple?: false;
  value?: string | null;
  defaultValue?: string | null;

  onValueChange?: (value: string | null, event: Event) => void;
}

interface ComboboxMultipleProps {
  multiple: true;
  value?: string[];
  defaultValue?: string[];

  onValueChange?: (value: string[], event: Event) => void;
}

export type ComboboxProps = ComboboxBaseProps &
  (ComboboxSingleProps | ComboboxMultipleProps) &
  FieldLabellingProps;

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

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1.1em" height="1.1em" fill="none" aria-hidden {...props}>
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
    columns,
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

  const inheritedDisabled = useIsFieldDisabled();
  const disabled = disabledProp || inheritedDisabled;
  const nameProps: FieldLabellingInput = {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  };

  const cacheRef = React.useRef<Map<string, ComboboxOption>>(new Map());
  for (const o of flattenOptions(options)) cacheRef.current.set(o.value, o);
  for (const o of flattenOptions(search?.results)) cacheRef.current.set(o.value, o);
  const toOption = React.useCallback(
    (v: string): ComboboxOption => cacheRef.current.get(v) ?? { value: v, label: v },
    [],
  );

  const [query, setQuery] = React.useState("");

  const isAsync = search != null;
  const source: readonly ComboboxOption[] | readonly ComboboxOptionGroup[] = isAsync
    ? (search.results ?? [])
    : (options ?? []);
  const gridColumns = columns != null ? Math.max(1, Math.floor(columns)) : undefined;
  const isGrid = gridColumns != null && gridColumns >= 2;
  const isVirtual = !!virtualized && !isGrid;
  const useGroups = !isVirtual && isGrouped(source);
  const flatOptions = flattenOptions(source);

  const trimmed = query.trim();
  const hasExactMatch = flatOptions.some(
    (o) => o.label.toLowerCase() === trimmed.toLowerCase() || o.value === trimmed,
  );
  const showCreate = freeText && trimmed !== "" && !hasExactMatch;
  const createOption: InternalOption = { value: trimmed, label: trimmed, create: true };

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
    (next: ComboboxOption | ComboboxOption[] | null, details: { event: Event }) => {
      if (multiple) {
        const arr = (next as ComboboxOption[]) ?? [];
        for (const o of arr) cacheRef.current.set(o.value, o);
        (onValueChange as ((v: string[], event: Event) => void) | undefined)?.(
          arr.map((o) => o.value),
          details.event,
        );
      } else {
        const o = next as ComboboxOption | null;
        if (o) cacheRef.current.set(o.value, o);
        (onValueChange as ((v: string | null, event: Event) => void) | undefined)?.(
          o ? o.value : null,
          details.event,
        );
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
      disabled={option.disabled}
      index={index}
      className={index === undefined ? itemClass : cx(itemClass, virtualItem)}
      style={
        index === undefined
          ? undefined
          : { top: index * VIRTUAL_ITEM_HEIGHT, height: VIRTUAL_ITEM_HEIGHT }
      }
    >
      {option.icon != null && !option.create && (
        <span className={itemIcon} aria-hidden>
          {renderIcon(option.icon, { state: { disabled: !!option.disabled } })}
        </span>
      )}
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

  const renderGridItem = (option: InternalOption) => {
    const hasIcon = option.icon != null && !option.create;
    return (
      <BaseCombobox.Item
        key={option.value}
        value={option}
        disabled={option.disabled}
        className={cx(gridItemClass, hasIcon && gridItemWithIcon, option.create && gridItemSpan)}
      >
        {hasIcon && (
          <span className={gridItemIcon} aria-hidden>
            {renderIcon(option.icon, { state: { disabled: !!option.disabled } })}
          </span>
        )}
        <span className={hasIcon ? gridItemCaption : gridItemLabel}>
          {option.create ? (
            <>
              <span className={createPrefix}>Add </span>“{option.label}”
            </>
          ) : (
            option.label
          )}
        </span>
        <BaseCombobox.ItemIndicator className={gridItemIndicator} render={<CheckIcon />} />
      </BaseCombobox.Item>
    );
  };

  const renderGridGroup = (grp: InternalGroup) => (
    <BaseCombobox.Group key={grp.label ?? "__create"} items={grp.items} className={groupClass}>
      {grp.label != null && (
        <BaseCombobox.GroupLabel className={groupLabelClass}>{grp.label}</BaseCombobox.GroupLabel>
      )}
      <div role="presentation" className={gridSection}>
        {gridRowsFrom(grp.items, gridColumns ?? 1, renderGridItem)}
      </div>
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
        grid={isGrid || undefined}
        virtualized={isVirtual || undefined}
        onItemHighlighted={isVirtual ? handleItemHighlighted : undefined}
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
              {isVirtual ? (
                <BaseCombobox.List className={list}>
                  <VirtualList scrollRef={virtualScrollRef} renderOption={renderOption} />
                </BaseCombobox.List>
              ) : isGrid ? (
                <BaseCombobox.List
                  className={gridList}
                  style={assignInlineVars({ [colsVar]: String(gridColumns ?? 1) })}
                >
                  {useGroups ? (
                    (grp: InternalGroup) => renderGridGroup(grp)
                  ) : (
                    <GridList cols={gridColumns ?? 1} renderItem={renderGridItem} />
                  )}
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

function gridRowsFrom(
  items: readonly InternalOption[],
  cols: number,
  renderItem: (option: InternalOption) => React.ReactNode,
): React.ReactNode[] {
  const options = items.filter((o) => !o.create);
  const creates = items.filter((o) => o.create);
  const rows: React.ReactNode[] = [];
  for (let i = 0; i < options.length; i += cols) {
    rows.push(
      <BaseCombobox.Row key={`row-${i}`} className={gridRow}>
        {options.slice(i, i + cols).map(renderItem)}
      </BaseCombobox.Row>,
    );
  }
  if (creates.length > 0) {
    rows.push(
      <BaseCombobox.Row key="row-create" className={gridRow}>
        {creates.map(renderItem)}
      </BaseCombobox.Row>,
    );
  }
  return rows;
}

interface GridListProps {
  cols: number;
  renderItem: (option: InternalOption) => React.ReactNode;
}

function GridList({ cols, renderItem }: GridListProps) {
  const filtered = BaseCombobox.useFilteredItems<InternalOption>();
  return <>{gridRowsFrom(filtered, cols, renderItem)}</>;
}

Combobox.displayName = "Combobox";
