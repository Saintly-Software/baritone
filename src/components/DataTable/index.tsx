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

export interface DataTableColumnMeta {
  align?: "start" | "center" | "end";

  groupLabel?: boolean;
}

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

export type DataTableFeatures = typeof dataTableFeatures;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- heterogeneous columns share one array, as TanStack's own columnHelper does
export type DataTableColumn<TData extends RowData> = ColumnDef<DataTableFeatures, TData, any>;

export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>();
}

export type DataTableName =
  | { caption: React.ReactNode; "aria-label"?: never; "aria-labelledby"?: never }
  | { "aria-label": string; caption?: never; "aria-labelledby"?: never }
  | { "aria-labelledby": string; caption?: never; "aria-label"?: never };

export interface DataTableBaseProps<TData extends RowData> extends Omit<
  React.TableHTMLAttributes<HTMLTableElement>,
  "aria-label" | "aria-labelledby" | "children"
> {
  data: ReadonlyArray<TData>;

  columns: ReadonlyArray<DataTableColumn<TData>>;

  getRowId?: (row: TData, index: number) => string;

  grouping?: ReadonlyArray<string>;

  defaultExpanded?: boolean;

  groupDisplay?: "columns" | "merge";

  enableRowSelection?: boolean | ((row: TData) => boolean);

  selectedRowIds?: ReadonlyArray<string>;

  defaultSelectedRowIds?: ReadonlyArray<string>;

  onSelectionChange?: (selectedRowIds: string[], selectedRows: TData[]) => void;

  renderDetailPanel?: (row: TData) => React.ReactNode;

  enableRowExpansion?: boolean | ((row: TData) => boolean);

  empty?: React.ReactNode;
  ref?: React.Ref<HTMLTableElement>;
}

export type DataTableProps<TData extends RowData> = DataTableBaseProps<TData> & DataTableName;

const NO_GROUPING: string[] = [];

const EMPTY_SET: ReadonlySet<string> = new Set();

const isDev = (): boolean =>
  typeof process === "undefined" || process.env.NODE_ENV !== "production";

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

function idsToRowSelection(ids: ReadonlyArray<string> | undefined): RowSelectionState {
  const selection: RowSelectionState = {};
  if (ids) for (const id of ids) selection[id] = true;
  return selection;
}

interface SelectionCheckboxProps {
  checked: boolean;

  indeterminate?: boolean;

  readOnly?: boolean;

  onChange: React.ChangeEventHandler<HTMLInputElement>;

  "aria-label": string;
}

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

const vetoToggle = (event: React.MouseEvent<HTMLInputElement>): void => event.preventDefault();

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

function groupRowLabel(row: { groupingValue?: unknown }): string {
  const value = row.groupingValue;
  return value == null || typeof value === "object" ? "group" : String(value);
}

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

function rowSelectLabel<TData extends RowData>(row: Row<DataTableFeatures, TData>): string {
  const value = rowPrimaryValue(row);
  return value != null ? `Select ${value}` : "Select row";
}

function rowExpandLabel<TData extends RowData>(
  row: Row<DataTableFeatures, TData>,
  expanded: boolean,
): string {
  const value = rowPrimaryValue(row);
  const target = value != null ? `details for ${value}` : "row details";
  return `${expanded ? "Collapse" : "Expand"} ${target}`;
}

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
  expanded: boolean;

  onClick: React.MouseEventHandler<HTMLButtonElement>;

  "aria-label": string;

  "aria-controls"?: string;
}

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
