"use client";
import {
  aggregationFns,
  type ColumnDef,
  columnGroupingFeature,
  createColumnHelper,
  createExpandedRowModel,
  createGroupedRowModel,
  flexRender,
  functionalUpdate,
  type OnChangeFn,
  type Row,
  type RowData,
  rowAggregationFeature,
  rowExpandingFeature,
  type RowSelectionState,
  rowSelectionFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import * as React from "react";
import { InternalCheckbox } from "../../internal/components/InternalCheckbox";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { cx } from "../../utils/cx";
import {
  cell as cellRecipe,
  dataTableCaption,
  dataTableRoot,
  detailCell,
  disclosureToggle,
  groupChevron,
  groupCount,
  groupDepthVar,
  groupLabel,
  groupRow,
  mergeLeafLabel,
  selectionInput,
  utilityCell,
} from "./dataTable.css";

/** Presentational options for a DataTable column, set through its `meta` slot. */
export interface DataTableColumnMeta {
  /** Horizontal alignment of the column's header and body cells. Default `start`. */
  align?: "start" | "center" | "end";
  /**
   * Under `groupDisplay="merge"`, host the merged group-label outline in this
   * column. At most one column should set it; defaults to the first non-grouped,
   * non-aggregated column. Ignored under `groupDisplay="columns"`.
   */
  groupLabel?: boolean;
}

/**
 * The TanStack v9 feature set every DataTable runs with: the grouping,
 * expansion, aggregation, and row-selection features plus their row models. The
 * `columnMeta` slot types `columnDef.meta` as {@link DataTableColumnMeta}.
 */
export const dataTableFeatures = tableFeatures({
  columnMeta: {} as DataTableColumnMeta,
  columnGroupingFeature,
  rowExpandingFeature,
  rowAggregationFeature,
  rowSelectionFeature,
  groupedRowModel: createGroupedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  aggregationFns,
});

/** The feature set's type — the first type argument to every `ColumnDef` / column helper below. */
export type DataTableFeatures = typeof dataTableFeatures;

/**
 * A DataTable column definition — a TanStack `ColumnDef` bound to DataTable's
 * feature set. Build these with {@link createDataTableColumnHelper} for
 * per-column value inference, or as plain objects.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- heterogeneous columns share one array, as TanStack's own columnHelper does
export type DataTableColumn<TData extends RowData> = ColumnDef<DataTableFeatures, TData, any>;

/**
 * A column helper pre-bound to DataTable's feature set, so callers write
 * `createDataTableColumnHelper<Person>()` and never repeat the feature type.
 *
 * @example
 * const col = createDataTableColumnHelper<Person>();
 * const columns = col.columns([
 *   col.accessor("name", { header: "Name" }),
 *   col.accessor("email", {
 *     header: "Email",
 *     cell: (c) => <Link href={`mailto:${c.getValue()}`}>{c.getValue()}</Link>,
 *   }),
 *   col.accessor("balance", { header: "Balance", meta: { align: "end" } }),
 * ]);
 */
export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>();
}

/**
 * A DataTable must be named. Provide exactly one of a visible `caption`,
 * `aria-label`, or `aria-labelledby` (the id of a visible heading); none — or
 * more than one — is a type error.
 */
export type DataTableName =
  | { caption: React.ReactNode; "aria-label"?: never; "aria-labelledby"?: never }
  | { "aria-label": string; caption?: never; "aria-labelledby"?: never }
  | { "aria-labelledby": string; caption?: never; "aria-label"?: never };

export interface DataTableBaseProps<TData extends RowData> extends Omit<
  React.TableHTMLAttributes<HTMLTableElement>,
  "aria-label" | "aria-labelledby" | "children"
> {
  /** The rows to render. Keep the reference stable across renders. */
  data: ReadonlyArray<TData>;
  /**
   * The column definitions, built with {@link createDataTableColumnHelper}. Keep
   * the reference stable across renders.
   */
  columns: ReadonlyArray<DataTableColumn<TData>>;
  /**
   * Derive a stable row id from each datum (e.g. `(row) => row.id`). Defaults to
   * the row index; supply it whenever the data can reorder, so React keys and
   * selection stay pinned to the row rather than its position.
   */
  getRowId?: (row: TData, index: number) => string;
  /**
   * Column ids to group rows by, in order, each inserting a collapsible header
   * row per distinct value with the group's label, count, and toggle. Columns
   * with an `aggregationFn` show a rolled-up value there. Controlled; omit or
   * pass `[]` for a flat table.
   */
  grouping?: ReadonlyArray<string>;
  /**
   * Whether groups start expanded. Default `true`. Seeds the initial render only;
   * the table owns expansion after that.
   */
  defaultExpanded?: boolean;
  /**
   * How grouped rows present, when `grouping` is set. Default `"columns"`.
   *
   * - `"columns"`: the grouped column stays its own column; leaf rows leave it blank.
   * - `"merge"`: the grouped column is folded into one indented outline column,
   *   hosted by the `meta.groupLabel` column (else the first non-grouped,
   *   non-aggregated one). Set that column's `header` to name the outline. Assumes
   *   flat columns — use `"columns"` when columns are nested under group headers.
   */
  groupDisplay?: "columns" | "merge";
  /**
   * Turn on row selection: a leading checkbox column with a select-all header box
   * and a per-row box. Pass `true` for every row, or a predicate to allow only
   * some (the rest render a disabled box). Pair with a stable {@link getRowId},
   * since selection is tracked by id.
   */
  enableRowSelection?: boolean | ((row: TData) => boolean);
  /**
   * The selected row ids (controlled). Pair with {@link onSelectionChange}. Omit
   * to let the table own selection (seed with {@link defaultSelectedRowIds}).
   * Ignored unless {@link enableRowSelection} is set.
   */
  selectedRowIds?: ReadonlyArray<string>;
  /** Initial selected ids for uncontrolled mode; read on the first render only. */
  defaultSelectedRowIds?: ReadonlyArray<string>;
  /**
   * Called after a selection change with the selected ids and their matching
   * rows. Fires in both modes. The ids are the source of truth — a selected id
   * can outlive a row paged or filtered out of `data`.
   */
  onSelectionChange?: (selectedRowIds: string[], selectedRows: TData[]) => void;
  /**
   * Render an expandable detail panel for a row: each data row grows a disclosure
   * toggle whose panel shows what this returns for the row's datum. Called only
   * for open rows. Pair with a stable {@link getRowId}. Omit for no expansion column.
   */
  renderDetailPanel?: (row: TData) => React.ReactNode;
  /**
   * Gate which rows can expand, when {@link renderDetailPanel} is set. `true`
   * (default) for every row, a predicate for some, or `false` to drop the
   * expander column entirely. Group-header rows are never gated.
   */
  enableRowExpansion?: boolean | ((row: TData) => boolean);
  /** What to render when `data` is empty — one cell spanning every column. */
  empty?: React.ReactNode;
  ref?: React.Ref<HTMLTableElement>;
}

/** DataTable props — the base props plus the required accessible name. */
export type DataTableProps<TData extends RowData> = DataTableBaseProps<TData> & DataTableName;

/** Stable empty grouping shared by every ungrouped table, to keep the reference steady. */
const NO_GROUPING: string[] = [];

/** Shared empty set for the "no columns hidden" case. */
const EMPTY_SET: ReadonlySet<string> = new Set();

const isDev = (): boolean =>
  typeof process === "undefined" || process.env.NODE_ENV !== "production";

/**
 * Renders columns and rows as a semantic `<table>`, built on TanStack React
 * Table v9. `grouping` adds collapsible group-header rows, `enableRowSelection` a
 * leading checkbox column, and `renderDetailPanel` a leading expander column with
 * per-row detail panels. Name the table with `caption`, `aria-label`, or
 * `aria-labelledby`; set column alignment through `meta.align`.
 *
 * @example
 * const col = createDataTableColumnHelper<Person>();
 * const columns = col.columns([
 *   col.accessor("name", { header: "Name" }),
 *   col.accessor("role", { header: "Role" }),
 *   col.accessor("balance", { header: "Balance", meta: { align: "end" } }),
 * ]);
 *
 * <DataTable caption="People" data={people} columns={columns} getRowId={(p) => p.id} />
 *
 * @example
 * // Group by role, with a per-group balance total.
 * const columns = col.columns([
 *   col.accessor("name", { header: "Name" }),
 *   col.accessor("role", { header: "Role" }),
 *   col.accessor("balance", {
 *     header: "Balance",
 *     meta: { align: "end" },
 *     aggregationFn: "sum",
 *     aggregatedCell: (info) => usd.format(info.getValue()),
 *   }),
 * ]);
 *
 * <DataTable caption="People" data={people} columns={columns} grouping={["role"]} />
 */
export function DataTable<TData extends RowData>(props: DataTableProps<TData>) {
  const {
    data,
    columns,
    getRowId,
    grouping,
    defaultExpanded,
    groupDisplay = "columns",
    enableRowSelection,
    selectedRowIds,
    defaultSelectedRowIds,
    onSelectionChange,
    renderDetailPanel,
    enableRowExpansion,
    empty,
    caption,
    className,
    ref,
    ...rest
  } = props as DataTableBaseProps<TData> & {
    caption?: React.ReactNode;
    "aria-label"?: string;
    "aria-labelledby"?: string;
  };

  if (isDev()) {
    const names = [
      caption != null && "caption",
      rest["aria-label"] != null && "aria-label",
      rest["aria-labelledby"] != null && "aria-labelledby",
    ].filter((v): v is string => typeof v === "string");
    if (names.length > 1) {
      throw new Error(
        `[baritone] DataTable: \`${names.join("`, `")}\` are mutually exclusive — pass exactly ` +
          "one. `aria-label`/`aria-labelledby` override the visible `caption` in the accessible " +
          "name, so the table would show one name and announce another.",
      );
    }
  }

  const groupingState = (grouping ?? NO_GROUPING) as string[];

  const selectionEnabled = enableRowSelection !== undefined && enableRowSelection !== false;
  const isSelectionControlled = selectedRowIds !== undefined;
  const [internalSelection, setInternalSelection] = React.useState<RowSelectionState>(() =>
    idsToRowSelection(defaultSelectedRowIds),
  );
  const controlledSelection = React.useMemo(
    () => idsToRowSelection(selectedRowIds),
    [selectedRowIds],
  );
  const rowSelection = isSelectionControlled ? controlledSelection : internalSelection;

  const dataById = React.useMemo(() => {
    const map = new Map<string, TData>();
    data.forEach((datum, index) => {
      map.set(getRowId ? getRowId(datum, index) : String(index), datum);
    });
    return map;
  }, [data, getRowId]);

  const rowCanSelect = React.useCallback(
    (row: Row<DataTableFeatures, TData>): boolean => {
      if (row.getIsGrouped()) return false;
      return typeof enableRowSelection === "function" ? enableRowSelection(row.original) : true;
    },
    [enableRowSelection],
  );

  const handleRowSelectionChange = React.useCallback<OnChangeFn<RowSelectionState>>(
    (updater) => {
      const next = functionalUpdate(updater, rowSelection);
      if (!isSelectionControlled) setInternalSelection(next);
      const ids = Object.keys(next);
      const rows = ids
        .map((id) => dataById.get(id))
        .filter((datum): datum is TData => datum !== undefined);
      onSelectionChange?.(ids, rows);
    },
    [rowSelection, isSelectionControlled, dataById, onSelectionChange],
  );

  const detailEnabled = renderDetailPanel != null && enableRowExpansion !== false;
  const rowCanExpand = (row: TData): boolean =>
    typeof enableRowExpansion === "function" ? enableRowExpansion(row) : true;
  const [expandedDetailIds, setExpandedDetailIds] = React.useState<ReadonlySet<string>>(EMPTY_SET);
  const toggleDetail = React.useCallback((rowId: string) => {
    setExpandedDetailIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  }, []);
  const detailBaseId = React.useId();
  const detailPanelId = (rowIndex: number) => `${detailBaseId}-detail-${rowIndex}`;

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    getRowId,
    state: { grouping: groupingState, rowSelection },
    initialState: { expanded: defaultExpanded === false ? {} : true },
    groupedColumnMode: false,
    enableRowSelection: selectionEnabled ? rowCanSelect : false,
    onRowSelectionChange: handleRowSelectionChange,
  });

  const rows = table.getRowModel().rows;

  const merge = groupDisplay === "merge" && groupingState.length > 0;

  const groupingSet = merge ? new Set(groupingState) : EMPTY_SET;
  const leafColumns = table.getAllLeafColumns();

  let hostColumnId: string | undefined;
  if (merge) {
    const aggregatedIds = collectAggregatedIds(columns);
    const explicit = leafColumns.find((c) => c.columnDef.meta?.groupLabel === true);
    const firstPlain = leafColumns.find((c) => !groupingSet.has(c.id) && !aggregatedIds.has(c.id));
    const grouped = leafColumns.filter((c) => groupingSet.has(c.id));
    const innermostGrouped = grouped[grouped.length - 1];
    hostColumnId = (explicit ?? firstPlain ?? innermostGrouped)?.id;
  }

  const isHidden = (columnId: string): boolean =>
    merge && groupingSet.has(columnId) && columnId !== hostColumnId;

  const leafColumnCount = leafColumns.filter((c) => !isHidden(c.id)).length;
  const headerGroups = table.getHeaderGroups();
  const totalColumnCount = leafColumnCount + (selectionEnabled ? 1 : 0) + (detailEnabled ? 1 : 0);
  const hasSelectableRows =
    selectionEnabled && table.getFilteredRowModel().flatRows.some((row) => row.getCanSelect());

  const renderGroupLabel = (row: (typeof rows)[number], valueNode: React.ReactNode) => {
    const expanded = row.getIsExpanded();
    const dataRowCount = row.getLeafRows().filter((r) => !r.getIsGrouped()).length;
    return (
      <span className={groupLabel} style={assignInlineVars({ [groupDepthVar]: String(row.depth) })}>
        <DisclosureToggle
          expanded={expanded}
          onClick={row.getToggleExpandedHandler()}
          aria-label={`${expanded ? "Collapse" : "Expand"} ${groupRowLabel(row)}`}
        />
        <span>{valueNode}</span>
        <span className={groupCount}>({dataRowCount})</span>
      </span>
    );
  };

  return (
    <table ref={ref} className={cx(dataTableRoot, className)} {...rest}>
      {caption != null && <caption className={dataTableCaption}>{caption}</caption>}
      <thead>
        {headerGroups.map((group, groupIndex) => (
          <tr key={group.id}>
            {detailEnabled && groupIndex === 0 && (
              <th
                scope="col"
                aria-label="Details"
                rowSpan={headerGroups.length > 1 ? headerGroups.length : undefined}
                className={cx(cellRecipe({ header: true, align: "center" }), utilityCell)}
              />
            )}
            {selectionEnabled && groupIndex === 0 && (
              <th
                scope="col"
                rowSpan={headerGroups.length > 1 ? headerGroups.length : undefined}
                className={cx(cellRecipe({ header: true, align: "center" }), utilityCell)}
              >
                <SelectionCheckbox
                  checked={table.getIsAllRowsSelected()}
                  indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllRowsSelected()}
                  readOnly={!hasSelectableRows}
                  onChange={table.getToggleAllRowsSelectedHandler()}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {group.headers.map((header) =>
              isHidden(header.column.id) ? null : (
                <th
                  key={header.id}
                  scope="col"
                  colSpan={header.colSpan > 1 ? header.colSpan : undefined}
                  className={cellRecipe({
                    header: true,
                    align: header.column.columnDef.meta?.align ?? "start",
                  })}
                >
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </th>
              ),
            )}
          </tr>
        ))}
      </thead>
      <tbody>
        {rows.length === 0 && empty != null ? (
          <tr>
            <td
              colSpan={totalColumnCount > 0 ? totalColumnCount : undefined}
              className={cellRecipe({ align: "center" })}
            >
              {empty}
            </td>
          </tr>
        ) : (
          rows.map((row, rowIndex) => {
            const isGroupRow = row.getIsGrouped();
            const groupHasSelectableLeaves =
              isGroupRow && row.getLeafRows().some((leaf) => leaf.getCanSelect());
            const canExpand = detailEnabled && !isGroupRow && rowCanExpand(row.original);
            const detailOpen = canExpand && expandedDetailIds.has(row.id);
            return (
              <React.Fragment key={row.id}>
                <tr className={isGroupRow ? groupRow : undefined}>
                  {detailEnabled && (
                    <td className={cx(cellRecipe({ align: "center" }), utilityCell)}>
                      {canExpand && (
                        <DisclosureToggle
                          expanded={detailOpen}
                          onClick={() => toggleDetail(row.id)}
                          aria-controls={detailOpen ? detailPanelId(rowIndex) : undefined}
                          aria-label={rowExpandLabel(row, detailOpen)}
                        />
                      )}
                    </td>
                  )}
                  {selectionEnabled && (
                    <td className={cx(cellRecipe({ align: "center" }), utilityCell)}>
                      {isGroupRow ? (
                        <SelectionCheckbox
                          checked={groupHasSelectableLeaves && row.getIsAllSubRowsSelected()}
                          indeterminate={groupHasSelectableLeaves && row.getIsSomeSelected()}
                          readOnly={!groupHasSelectableLeaves}
                          onChange={(event) => row.toggleSelected(event.target.checked)}
                          aria-label={`Select all rows in ${groupRowLabel(row)}`}
                        />
                      ) : (
                        <SelectionCheckbox
                          checked={row.getCanSelect() && row.getIsSelected()}
                          readOnly={!row.getCanSelect()}
                          onChange={row.getToggleSelectedHandler()}
                          aria-label={rowSelectLabel(row)}
                        />
                      )}
                    </td>
                  )}
                  {row.getAllCells().map((cell) => {
                    if (isHidden(cell.column.id)) return null;

                    const align = cell.column.columnDef.meta?.align ?? "start";
                    const isHostCell = merge && cell.column.id === hostColumnId;

                    let content: React.ReactNode;
                    if (cell.getIsGrouped() || (isHostCell && isGroupRow)) {
                      const valueCell = cell.getIsGrouped()
                        ? cell
                        : row.getAllCells().find((c) => c.getIsGrouped());
                      content = renderGroupLabel(
                        row,
                        valueCell ? <table.FlexRender cell={valueCell} /> : null,
                      );
                    } else if (cell.getIsAggregated()) {
                      content = flexRender(
                        cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                        cell.getContext(),
                      );
                    } else if (cell.getIsPlaceholder()) {
                      content = null;
                    } else if (isHostCell) {
                      content = (
                        <span
                          className={mergeLeafLabel}
                          style={assignInlineVars({ [groupDepthVar]: String(row.depth) })}
                        >
                          <table.FlexRender cell={cell} />
                        </span>
                      );
                    } else {
                      content = <table.FlexRender cell={cell} />;
                    }

                    return (
                      <td key={cell.id} className={cellRecipe({ align })}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
                {detailOpen && (
                  <tr>
                    <td
                      colSpan={totalColumnCount > 0 ? totalColumnCount : undefined}
                      className={detailCell}
                    >
                      <div id={detailPanelId(rowIndex)}>{renderDetailPanel?.(row.original)}</div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })
        )}
      </tbody>
    </table>
  );
}

DataTable.displayName = "DataTable";

/** Build TanStack's `Record<id, true>` selection map from a list of ids. */
function idsToRowSelection(ids: ReadonlyArray<string> | undefined): RowSelectionState {
  const selection: RowSelectionState = {};
  if (ids) for (const id of ids) selection[id] = true;
  return selection;
}

interface SelectionCheckboxProps {
  /** Whether the box is ticked. */
  checked: boolean;
  /** Show the "mixed" dash (a parent whose children are only partly selected). */
  indeterminate?: boolean;
  /**
   * Lock the box (a non-selectable row): dim it and veto toggling, but keep it
   * focusable via `aria-disabled` rather than the native `disabled` attribute
   * (the house convention; see AGENTS.md).
   */
  readOnly?: boolean;
  /** Toggle handler; receives the raw change event (Shift state included). */
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  /** Accessible name — the box carries no visible label. */
  "aria-label": string;
}

/**
 * The checkbox in a selection cell: a real, focusable `<input type="checkbox">`
 * laid transparently over the presentational {@link InternalCheckbox}. The
 * "mixed" state is set from a ref, since it has no HTML attribute.
 */
function SelectionCheckbox({
  checked,
  indeterminate = false,
  readOnly = false,
  onChange,
  "aria-label": ariaLabel,
}: SelectionCheckboxProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <InternalCheckbox
      size="sm"
      checked={indeterminate ? "indeterminate" : checked}
      disabled={readOnly}
    >
      <input
        ref={inputRef}
        type="checkbox"
        className={selectionInput}
        checked={checked}
        readOnly={readOnly}
        aria-disabled={readOnly || undefined}
        onChange={readOnly ? undefined : onChange}
        onClick={readOnly ? vetoToggle : undefined}
        aria-label={ariaLabel}
      />
    </InternalCheckbox>
  );
}

/** Cancel a locked box's toggle without removing it from the tab order. */
const vetoToggle = (event: React.MouseEvent<HTMLInputElement>): void => event.preventDefault();

/**
 * The ids of columns given an explicit `aggregationFn` or `aggregatedCell`, so
 * such a column is never chosen as the default merged-label host. Reads the
 * authored defs (recursing into group columns), since v9 fills defaults onto
 * resolved columns.
 */
function collectAggregatedIds<TData extends RowData>(
  defs: ReadonlyArray<DataTableColumn<TData>>,
  acc: Set<string> = new Set(),
): Set<string> {
  for (const def of defs) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ColumnDef is a union (group vs accessor vs display); probe structurally
    const anyDef = def as any;
    if (Array.isArray(anyDef.columns)) {
      collectAggregatedIds(anyDef.columns, acc);
    } else if (anyDef.aggregationFn != null || anyDef.aggregatedCell != null) {
      const id: unknown = anyDef.id ?? anyDef.accessorKey;
      if (typeof id === "string") acc.add(id);
    }
  }
  return acc;
}

/**
 * A group's human-readable name, for the toggle's `aria-label`. Uses the row's
 * grouping value when it's a primitive; falls back to "group" otherwise (a
 * formatted or element value has no sensible string form for a label).
 */
function groupRowLabel(row: { groupingValue?: unknown }): string {
  const value = row.groupingValue;
  return value == null || typeof value === "object" ? "group" : String(value);
}

/**
 * A row's first cell carrying a usable primitive, for naming a per-row control.
 * Skips grouped and placeholder cells (whose value is shared across the group)
 * and returns `undefined` when no cell has a sensible string form.
 */
function rowPrimaryValue<TData extends RowData>(
  row: Row<DataTableFeatures, TData>,
): string | undefined {
  for (const cell of row.getAllCells()) {
    if (cell.getIsGrouped() || cell.getIsPlaceholder()) continue;
    const value = cell.getValue();
    if (value != null && value !== "" && typeof value !== "object" && typeof value !== "function") {
      return String(value);
    }
  }
  return undefined;
}

/**
 * The accessible name for a data row's selection box — `Select <value>` from
 * {@link rowPrimaryValue}, falling back to "Select row".
 */
function rowSelectLabel<TData extends RowData>(row: Row<DataTableFeatures, TData>): string {
  const value = rowPrimaryValue(row);
  return value != null ? `Select ${value}` : "Select row";
}

/**
 * The accessible name for a row's detail-panel toggle, e.g. "Expand details for
 * Ada Lovelace" (from {@link rowPrimaryValue}), falling back to "row details".
 */
function rowExpandLabel<TData extends RowData>(
  row: Row<DataTableFeatures, TData>,
  expanded: boolean,
): string {
  const value = rowPrimaryValue(row);
  const target = value != null ? `details for ${value}` : "row details";
  return `${expanded ? "Collapse" : "Expand"} ${target}`;
}

/** The decorative disclosure chevron; points down when expanded, right when collapsed. */
function ChevronGlyph({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={groupChevron}
      data-expanded={expanded || undefined}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

interface DisclosureToggleProps {
  /** Whether the disclosed content — a group's rows, or a row's detail panel — is open. */
  expanded: boolean;
  /** Toggle handler. `getToggleExpandedHandler()`'s `() => void` is accepted too. */
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  /** Accessible name — the toggle carries no visible label. */
  "aria-label": string;
  /** The id of the panel this toggle controls, when one is in the DOM. */
  "aria-controls"?: string;
}

/**
 * The bare, focusable disclosure button shared by the group-header and row
 * detail-panel toggles. Semantics (`onClick`, name, `aria-controls`) are supplied
 * per use.
 */
function DisclosureToggle({
  expanded,
  onClick,
  "aria-label": ariaLabel,
  "aria-controls": ariaControls,
}: DisclosureToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-controls={ariaControls}
      aria-label={ariaLabel}
      className={cx(disclosureToggle, focusRingRecipe({ type: "visible", offset: "sm" }))}
    >
      <ChevronGlyph expanded={expanded} />
    </button>
  );
}
