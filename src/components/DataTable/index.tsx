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

/**
 * DataTable's column meta — presentational options layered onto a column via
 * its `meta` slot. Wired as a type-only `columnMeta` feature slot (see
 * {@link dataTableFeatures}), so `columnDef.meta` is typed as this.
 */
export interface DataTableColumnMeta {
  /** Horizontal alignment of the column's header and body cells. Default `start`. */
  align?: "start" | "center" | "end";
  /**
   * In `groupDisplay="merge"`, marks this column as host for the merged group
   * label (value + toggle + count on header rows, indented value on leaf rows).
   * At most one column should set it; defaults to the first non-grouped,
   * non-aggregated column. Ignored under the default `groupDisplay="columns"`.
   */
  groupLabel?: boolean;
}

/**
 * The feature set every DataTable runs with: core plus the grouping stack
 * (`columnGroupingFeature`, `rowExpandingFeature`, `rowAggregationFeature`) and
 * `rowSelectionFeature`. Always registered, but inert when unused — with no
 * `grouping` the grouped row model is a pass-through, and with selection off
 * the table option is forced `false`. The `columnMeta` slot is phantom at
 * runtime; only its type is used, to type `columnDef.meta` as
 * {@link DataTableColumnMeta}.
 */
export const dataTableFeatures = tableFeatures({
  columnMeta: {} as DataTableColumnMeta,
  columnGroupingFeature,
  rowExpandingFeature,
  rowAggregationFeature,
  rowSelectionFeature,
  groupedRowModel: createGroupedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  // Registers the built-in aggregationFns so `aggregationFn: "sum"` (etc.)
  // resolves by name — v9 doesn't auto-register these.
  aggregationFns,
});

/** The feature set's type — the first type argument to every `ColumnDef` / column helper below. */
export type DataTableFeatures = typeof dataTableFeatures;

/**
 * A DataTable column definition — a TanStack `ColumnDef` bound to DataTable's
 * feature set. Build with {@link createDataTableColumnHelper} (recommended, for
 * per-column inference) or as plain objects.
 *
 * `TValue` is `any` for the same reason TanStack's own `columnHelper.columns()`
 * returns `ColumnDef<…, any>[]`: columns are heterogeneous, each with its own
 * value type, and `any` is what lets them share one array. Columns built
 * through the helper stay individually type-checked.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- see doc comment
export type DataTableColumn<TData extends RowData> = ColumnDef<DataTableFeatures, TData, any>;

/**
 * A column helper pre-bound to DataTable's feature set — `createColumnHelper`
 * with the `DataTableFeatures` generic already applied, so callers write
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
 * A DataTable must be named. Provide exactly one of a visible `caption` (renders
 * a `<caption>`, which also names the table for assistive tech), `aria-label` (a
 * literal string), or `aria-labelledby` (the id of a visible heading). The union
 * makes providing none — or two — a type error, mirroring `CardList`.
 */
export type DataTableName =
  | { caption: React.ReactNode; "aria-label"?: never; "aria-labelledby"?: never }
  | { "aria-label": string; caption?: never; "aria-labelledby"?: never }
  | { "aria-labelledby": string; caption?: never; "aria-label"?: never };

export interface DataTableBaseProps<TData extends RowData> extends Omit<
  React.TableHTMLAttributes<HTMLTableElement>,
  "aria-label" | "aria-labelledby" | "children"
> {
  /**
   * The rows to render. Keep this reference stable across renders — a fresh
   * array every render throws away TanStack's memoised row model.
   */
  data: ReadonlyArray<TData>;
  /**
   * The column definitions. Build them with {@link createDataTableColumnHelper}
   * for per-column value inference. Keep this reference stable across renders too.
   */
  columns: ReadonlyArray<DataTableColumn<TData>>;
  /**
   * Derive a stable row id from each datum (e.g. `(row) => row.id`). Defaults to
   * the row's index; supply it whenever the data can reorder, so React keys and
   * row selection stay pinned to the row, not its position.
   */
  getRowId?: (row: TData, index: number) => string;
  /**
   * Column ids to group rows by, applied in order (first id, then the second
   * within each group). Each id must match a column's id; omit or pass `[]` for
   * a flat table.
   *
   * Inserts a collapsible header row per distinct value with the group's label,
   * row count, and expand/collapse toggle; a column with `aggregationFn` shows
   * its rolled-up value there. Controlled — the table renders whatever you pass
   * and owns only the expanded/collapsed state (see `defaultExpanded`).
   */
  grouping?: ReadonlyArray<string>;
  /**
   * Whether groups start expanded (default `true`; `false` starts fully
   * collapsed). Only seeds the initial render — the table owns expansion after
   * that, so changing this later won't re-collapse an open table.
   */
  defaultExpanded?: boolean;
  /**
   * How grouped rows present, when `grouping` is set. Default `"columns"`.
   *
   * - `"columns"`: the grouped column stays its own column — group-header rows
   *   carry the label, leaf rows leave it blank. The original layout.
   * - `"merge"`: grouped columns render as one indented outline column instead
   *   (label + toggle + count on header rows, the row's own value on leaf rows).
   *   The host is the column with `meta.groupLabel: true`, else the first
   *   non-grouped, non-aggregated column, else the innermost grouped column. Set
   *   the host's `header` to name the outline. Inert without `grouping`.
   *
   * `"merge"` assumes flat columns — a grouped leaf nested inside a column group
   * leaves that group's header at its original `colSpan`, wider than the body.
   * Use `"columns"` for columns nested under group headers.
   */
  groupDisplay?: "columns" | "merge";
  /**
   * Turn on row selection: a leading checkbox column, "select all" in the
   * header, a checkbox per row. Pass `true` for every row selectable, or a
   * predicate `(row) => boolean` for only some (the rest render disabled). Omit
   * for no selection column.
   *
   * Pair with a stable {@link getRowId} — selection tracks by id, so without one
   * it pins to row *index* and mis-tracks on reorder. With `grouping` on, each
   * group header gets a tri-state box selecting/clearing its rows.
   */
  enableRowSelection?: boolean | ((row: TData) => boolean);
  /**
   * The selected rows' ids (controlled). Pair with {@link onSelectionChange} and
   * keep the reference stable across renders. Omit to let the table own selection
   * internally (seed that with {@link defaultSelectedRowIds}). Ignored unless
   * {@link enableRowSelection} is set.
   */
  selectedRowIds?: ReadonlyArray<string>;
  /**
   * Initial selected ids for the uncontrolled mode; the table then owns the
   * selection. Ignored once {@link selectedRowIds} is provided (controlled), and
   * only read on the first render.
   */
  defaultSelectedRowIds?: ReadonlyArray<string>;
  /**
   * Called after a selection change with the selected ids and the matching rows
   * from `data`. Fires in both controlled and uncontrolled modes. Prefer the ids
   * for persistence — one can outlive a row that's been paged or filtered out.
   */
  onSelectionChange?: (selectedRowIds: string[], selectedRows: TData[]) => void;
  /**
   * Render an expandable detail panel for a row. When provided, each data row
   * grows a leading disclosure toggle; opening it reveals a full-width panel
   * beneath the row from `(row) => <RowDetails person={row} />`. Runs only for
   * open rows, so an expensive panel costs nothing until it's opened.
   *
   * Panels start collapsed and toggle independently; the table owns that state.
   * Every row is expandable by default — narrow with {@link enableRowExpansion}.
   * Group-header rows never get a detail toggle. Omit for no expansion column.
   * Pair with a stable {@link getRowId} so an open panel stays pinned on reorder.
   */
  renderDetailPanel?: (row: TData) => React.ReactNode;
  /**
   * Gate which rows can expand, when {@link renderDetailPanel} is set. `true`
   * (default) lets every row expand; a predicate `(row) => boolean` allows only
   * some (others get an empty expander cell so columns still line up); `false`
   * drops the expander column entirely — handy for toggling the feature without
   * conditionally threading `renderDetailPanel`. Mirrors
   * {@link enableRowSelection}. Ignored without `renderDetailPanel`.
   */
  enableRowExpansion?: boolean | ((row: TData) => boolean);
  /**
   * What to render when `data` is empty — shown as a single cell spanning every
   * column. With none, the body is simply empty (just the header shows).
   */
  empty?: React.ReactNode;
  ref?: React.Ref<HTMLTableElement>;
}

/** DataTable props — the base props plus the required accessible name. */
export type DataTableProps<TData extends RowData> = DataTableBaseProps<TData> & DataTableName;

/**
 * Stable empty grouping shared by every ungrouped table — a fresh `[]` each
 * render would churn the controlled `grouping` state and its derived row model.
 */
const NO_GROUPING: string[] = [];

/**
 * Shared empty set for the "no columns hidden" case (default `"columns"`
 * presentation, or `"merge"` before `grouping` is set) — so the non-merge path
 * allocates nothing per render.
 */
const EMPTY_SET: ReadonlySet<string> = new Set();

// Dev/test only, mirroring `Table`/Field's `assertExclusiveNames`: deterministic
// on props, so it trips in dev/test/CI before production, and dead-code-
// eliminates out of the production bundle.
const isDev = (): boolean =>
  typeof process === "undefined" || process.env.NODE_ENV !== "production";

/**
 * DataTable — renders columns and rows as a semantic `<table>`, built on
 * TanStack React Table v9 (headless: it owns the row/column model; we own the
 * markup, styles, and a11y). With `grouping` set it adds collapsible
 * group-header rows; `enableRowSelection` adds a leading checkbox column;
 * `renderDetailPanel` adds a leading expander column whose toggle reveals a
 * full-width detail panel beneath the row.
 *
 * Pass `data` and `columns` (build with {@link createDataTableColumnHelper}),
 * and name the table with `caption`, `aria-label`, or `aria-labelledby`. Set a
 * column's alignment through `meta.align`.
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
 * // Group by role, with a per-group balance total (aggregation lives on the column).
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
 *
 * @example
 * // `groupDisplay="merge"`: one indented outline column, grouped by Category
 * // with a summed Amount. The host column's `header` names the outline.
 * const col = createDataTableColumnHelper<Expense>();
 * const columns = col.columns([
 *   col.accessor("subcategory", { header: "Category" }),
 *   col.accessor("category", { header: "Category" }),
 *   col.accessor("amount", {
 *     header: "Amount",
 *     meta: { align: "end" },
 *     cell: (info) => usd.format(info.getValue()),
 *     aggregationFn: "sum",
 *     aggregatedCell: (info) => usd.format(info.getValue()),
 *   }),
 * ]);
 *
 * <DataTable
 *   caption="Spending by category"
 *   data={expenses}
 *   columns={columns}
 *   grouping={["category"]}
 *   groupDisplay="merge"
 * />
 *
 * @example
 * // Row selection, controlled by id (pair with a stable `getRowId`).
 * const [selected, setSelected] = React.useState<string[]>([]);
 * <DataTable
 *   caption="People"
 *   data={people}
 *   columns={columns}
 *   getRowId={(p) => p.id}
 *   enableRowSelection
 *   selectedRowIds={selected}
 *   onSelectionChange={setSelected}
 * />
 *
 * @example
 * // Expandable per-row detail panels: each row grows a disclosure toggle, and
 * // `renderDetailPanel` returns the panel's contents from the row's datum.
 * <DataTable
 *   caption="People"
 *   data={people}
 *   columns={columns}
 *   getRowId={(p) => p.id}
 *   renderDetailPanel={(person) => (
 *     <dl>
 *       <dt>Email</dt>
 *       <dd>{person.email}</dd>
 *     </dl>
 *   )}
 * />
 */
export function DataTable<TData extends RowData>(props: DataTableProps<TData>) {
  // `props` is a union over the naming arms; widen to read the fields. `caption`
  // is pulled out to render as `<caption>`; `aria-label`/`aria-labelledby` stay
  // in `rest` to forward onto the `<table>`.
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

  // A visible `caption` plus `aria-label`/`aria-labelledby` names the table
  // twice (the aria value wins in the accessible name), so reject it in dev for
  // JS callers and type-casts too — mirroring `Table`/Field's `assertExclusiveNames`.
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

  // Controlled grouping: the table reads `state.grouping` and never mutates it,
  // so passing the prop through (a stable empty array by default) is enough — no
  // `onGroupingChange` needed. The `string[]` cast is safe since TanStack treats
  // state as read-only.
  const groupingState = (grouping ?? NO_GROUPING) as string[];

  // Selection is on whenever `enableRowSelection` is set (`true` or a
  // predicate); `false`/omitted leaves the column off and forces the table
  // option `false`.
  const selectionEnabled = enableRowSelection !== undefined && enableRowSelection !== false;
  // Controlled when the consumer owns `selectedRowIds`; otherwise the table
  // keeps its own selection, seeded once from `defaultSelectedRowIds` (mirrors
  // `ToggleButton`).
  const isSelectionControlled = selectedRowIds !== undefined;
  const [internalSelection, setInternalSelection] = React.useState<RowSelectionState>(() =>
    idsToRowSelection(defaultSelectedRowIds),
  );
  // TanStack's selection map (`Record<id, true>`), derived from `selectedRowIds`
  // when controlled (memoised so the reference is stable), else internal state.
  const controlledSelection = React.useMemo(
    () => idsToRowSelection(selectedRowIds),
    [selectedRowIds],
  );
  const rowSelection = isSelectionControlled ? controlledSelection : internalSelection;

  // id → datum, so a selection change can hand back the selected rows (not just
  // their ids) without walking the table. Keyed exactly like `getRowId`.
  const dataById = React.useMemo(() => {
    const map = new Map<string, TData>();
    data.forEach((datum, index) => {
      map.set(getRowId ? getRowId(datum, index) : String(index), datum);
    });
    return map;
  }, [data, getRowId]);

  // Group-header rows aren't independently selectable, so only real data rows
  // enter the selection map. Memoised on `enableRowSelection` so identity is
  // stable exactly when that prop is; an inline predicate still changes each
  // render, but we deliberately key on it (not a latest-ref) so a changed
  // predicate does re-evaluate selectability.
  const rowCanSelect = React.useCallback(
    (row: Row<DataTableFeatures, TData>): boolean => {
      if (row.getIsGrouped()) return false;
      return typeof enableRowSelection === "function" ? enableRowSelection(row.original) : true;
    },
    [enableRowSelection],
  );

  // Bridges TanStack's `Record<id, true>` updater to the public `string[]` API:
  // resolve the next map, commit locally when uncontrolled, notify either way.
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

  // Row detail panels use their own state, deliberately separate from
  // TanStack's `state.expanded` (which the grouping stack seeds to `true`, every
  // group open) — routing detail rows through that would read as "every panel
  // open" on first render. Uncontrolled, seeded from the shared empty set so a
  // table without panels allocates nothing.
  //
  // The feature is on when a renderer is given and `enableRowExpansion` isn't a
  // hard `false` (mirrors `enableRowSelection: false`). `!= null` (not
  // `!== undefined`) mirrors the other optional render props, so an explicit
  // `renderDetailPanel={null}` disables the feature too.
  const detailEnabled = renderDetailPanel != null && enableRowExpansion !== false;
  // Mirrors `rowCanSelect` minus `useCallback`: called only inline in the row
  // map (nothing memoises on its identity, unlike `rowCanSelect`), so a plain
  // function is enough. Group rows are excluded at the call site instead.
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
  // Scope panel ids to this table instance so two tables on one page don't
  // collide. Keyed off render position, not `row.id` — a `getRowId` may return a
  // string with spaces, which would break `aria-controls` (a space-separated
  // IDREF list) silently.
  const detailBaseId = React.useId();
  const detailPanelId = (rowIndex: number) => `${detailBaseId}-detail-${rowIndex}`;

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    getRowId,
    state: { grouping: groupingState, rowSelection },
    // Seed the internally-owned expansion; `true` opens every group, `{}` starts
    // them all collapsed. Read once (initial state), so recomputing it is fine.
    initialState: { expanded: defaultExpanded === false ? {} : true },
    // Keep the author's column order — don't hoist grouped columns to the front.
    groupedColumnMode: false,
    // Selection: `false` keeps the feature fully inert; otherwise the per-row
    // predicate gates rows, and the change handler feeds state back or local.
    enableRowSelection: selectionEnabled ? rowCanSelect : false,
    onRowSelectionChange: handleRowSelectionChange,
  });

  const rows = table.getRowModel().rows;

  // Merge presentation only kicks in once there's something to group — with no
  // `grouping` a "merge" table is byte-for-byte the plain table.
  const merge = groupDisplay === "merge" && groupingState.length > 0;

  const groupingSet = merge ? new Set(groupingState) : EMPTY_SET;
  const leafColumns = table.getAllLeafColumns();

  // Pick the column that hosts the merged group label, in priority order:
  //  1. an explicit `meta.groupLabel` opt-in;
  //  2. else the first column that's neither grouped nor aggregated (so a column
  //     with an `aggregationFn` keeps its per-group total);
  //  3. else the innermost grouped column, kept visible as the outline (reached
  //     when every non-grouped column aggregates, or every column is grouped).
  // `merge` guarantees at least one grouped column, so a host always exists.
  // Computed inline, not memoised, so it can't drift from `columns`/`meta`.
  let hostColumnId: string | undefined;
  if (merge) {
    const aggregatedIds = collectAggregatedIds(columns);
    const explicit = leafColumns.find((c) => c.columnDef.meta?.groupLabel === true);
    const firstPlain = leafColumns.find((c) => !groupingSet.has(c.id) && !aggregatedIds.has(c.id));
    const grouped = leafColumns.filter((c) => groupingSet.has(c.id));
    const innermostGrouped = grouped[grouped.length - 1];
    hostColumnId = (explicit ?? firstPlain ?? innermostGrouped)?.id;
  }

  // Grouped columns are dropped from the layout in merge mode, except the host.
  // Filtering happens here at render time (keeping `groupedColumnMode: false`),
  // so the row model, aggregation, and the grouped cell's renderer stay intact.
  const isHidden = (columnId: string): boolean =>
    merge && groupingSet.has(columnId) && columnId !== hostColumnId;

  const leafColumnCount = leafColumns.filter((c) => !isHidden(c.id)).length;
  const headerGroups = table.getHeaderGroups();
  // The leading utility columns (selection box, detail expander) each add one
  // leaf — fold them into the empty-state/detail-panel `colSpan`.
  const totalColumnCount = leafColumnCount + (selectionEnabled ? 1 : 0) + (detailEnabled ? 1 : 0);
  // Whether any row can actually be selected — with a predicate excluding every
  // row, "select all" would be a focusable no-op, so lock it (mirrors
  // `groupHasSelectableLeaves`).
  const hasSelectableRows =
    selectionEnabled && table.getFilteredRowModel().flatRows.some((row) => row.getCanSelect());

  // The group-label cluster — toggle, group value, data-row count — indented by
  // depth. Shared by both presentations: fills the grouped column's cell in
  // `"columns"` mode, the host column's cell in `"merge"` mode. A plain render
  // helper (not a component) so it closes over `table`/state without remounting.
  const renderGroupLabel = (row: (typeof rows)[number], valueNode: React.ReactNode) => {
    const expanded = row.getIsExpanded();
    // Count underlying data rows, not immediate children — with a second
    // grouping column, `subRows` are sub-groups, so flatten to the leaves.
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
            {/* The expander column's header — a spacer over per-row toggles, named
                for screen-reader navigation. Spans every header row via `rowSpan`. */}
            {detailEnabled && groupIndex === 0 && (
              <th
                scope="col"
                aria-label="Details"
                rowSpan={headerGroups.length > 1 ? headerGroups.length : undefined}
                className={cx(cellRecipe({ header: true, align: "center" }), utilityCell)}
              />
            )}
            {/* The "select all" box. On a multi-row header (grouped column defs)
                it spans every header row via `rowSpan`, rendered only once. */}
            {selectionEnabled && groupIndex === 0 && (
              <th
                scope="col"
                rowSpan={headerGroups.length > 1 ? headerGroups.length : undefined}
                className={cx(cellRecipe({ header: true, align: "center" }), utilityCell)}
              >
                <SelectionCheckbox
                  checked={table.getIsAllRowsSelected()}
                  // `getIsSomePageRowsSelected` counts only selectable rows, so a
                  // lingering id with no matching row can't fake a mixed header.
                  indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllRowsSelected()}
                  readOnly={!hasSelectableRows}
                  onChange={table.getToggleAllRowsSelectedHandler()}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {group.headers.map((header) =>
              // Drop the grouped column's header in merge mode — it no longer has
              // a column of its own.
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
            // A group whose every leaf is excluded by the predicate can't be
            // toggled (`getIsAllSubRowsSelected` reports "all" for an empty set),
            // so lock its box instead of showing a checked no-op.
            const groupHasSelectableLeaves =
              isGroupRow && row.getLeafRows().some((leaf) => leaf.getCanSelect());
            // Detail panels open only for expandable data rows — group headers and
            // predicate-excluded rows keep an empty expander cell instead.
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
                        // A group header's box selects or clears every row it holds,
                        // and shows the tri-state (all / some / none) of its children.
                        <SelectionCheckbox
                          checked={groupHasSelectableLeaves && row.getIsAllSubRowsSelected()}
                          indeterminate={groupHasSelectableLeaves && row.getIsSomeSelected()}
                          readOnly={!groupHasSelectableLeaves}
                          onChange={(event) => row.toggleSelected(event.target.checked)}
                          aria-label={`Select all rows in ${groupRowLabel(row)}`}
                        />
                      ) : (
                        // A data row's box. `getToggleSelectedHandler` passes the raw
                        // change event, so Shift-click range selection works. Gate
                        // `checked` on `getCanSelect` too — a stale id for a
                        // now-locked row must never read as checked.
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
                    // Merge mode: the grouped columns have no column of their own —
                    // their label lives in the host column instead.
                    if (isHidden(cell.column.id)) return null;

                    const align = cell.column.columnDef.meta?.align ?? "start";
                    const isHostCell = merge && cell.column.id === hostColumnId;

                    let content: React.ReactNode;
                    if (cell.getIsGrouped() || (isHostCell && isGroupRow)) {
                      // The group label: toggle, value, data-row count, indented by
                      // depth. In `"columns"` mode this *is* the grouped cell; in
                      // `"merge"` mode it's the host cell, with the value taken from
                      // this row's grouped cell so formatting matches.
                      const valueCell = cell.getIsGrouped()
                        ? cell
                        : row.getAllCells().find((c) => c.getIsGrouped());
                      content = renderGroupLabel(
                        row,
                        valueCell ? <table.FlexRender cell={valueCell} /> : null,
                      );
                    } else if (cell.getIsAggregated()) {
                      // A rolled-up value on a group row: prefer the column's
                      // `aggregatedCell` template, falling back to its normal `cell`.
                      content = flexRender(
                        cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                        cell.getContext(),
                      );
                    } else if (cell.getIsPlaceholder()) {
                      // A cell shadowed by the group above it — render nothing.
                      content = null;
                    } else if (isHostCell) {
                      // Merge mode, leaf row: the host's own value, indented one
                      // level in from its group header so the outline lines up.
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
   * focusable via `aria-disabled` — never the native `disabled` attribute (house
   * convention; see AGENTS.md). base-ui's `Checkbox` models disabled the same way.
   */
  readOnly?: boolean;
  /** Toggle handler; receives the raw change event (Shift state included). */
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  /** Accessible name — the box carries no visible label. */
  "aria-label": string;
}

/**
 * The checkbox in a selection cell: a real, focusable `<input type="checkbox">`
 * laid transparently over the presentational {@link InternalCheckbox} (the
 * look, focus ring, mixed dash). "Mixed" has no DOM attribute, only the
 * `indeterminate` property, so it's set from a ref whenever it changes.
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
        // Drop the handler and veto the click when locked, so the box can't toggle
        // yet stays focusable (`readOnly` suppresses React's controlled-input warning).
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
 * The ids of columns the author gave a per-group aggregate (an explicit
 * `aggregationFn` or `aggregatedCell`) — used so such a column doesn't become
 * the default merged-label host.
 *
 * Reads the *authored* defs, not `column.columnDef`: v9 fills in defaults for
 * both on every resolved column, so only the authored shape can tell an
 * intended aggregate from a plain one. Recurses into group columns; a leaf's id
 * is its explicit `id`, else `accessorKey`.
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
 * A row's own descriptive value — its first cell with a usable primitive — used
 * to give a per-row control an unambiguous name. Returns `undefined` when no
 * cell has a sensible string form, so the caller can supply its own fallback.
 *
 * Skips grouped and placeholder cells: the grouped column's cell carries the
 * *group's* value (shared by every row), which would give every row's control
 * the same name.
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
 * The accessible name for a data row's selection box: leads with the row's
 * descriptive value (via {@link rowPrimaryValue}), mirroring the group box's
 * `Select all rows in <value>`; falls back to "Select row" otherwise.
 */
function rowSelectLabel<TData extends RowData>(row: Row<DataTableFeatures, TData>): string {
  const value = rowPrimaryValue(row);
  return value != null ? `Select ${value}` : "Select row";
}

/**
 * The accessible name for a row's detail-panel toggle — "Expand"/"Collapse"
 * followed by the row's descriptive value (via {@link rowPrimaryValue}), e.g.
 * "Expand details for Ada Lovelace". Falls back to "row details" otherwise.
 */
function rowExpandLabel<TData extends RowData>(
  row: Row<DataTableFeatures, TData>,
  expanded: boolean,
): string {
  const value = rowPrimaryValue(row);
  const target = value != null ? `details for ${value}` : "row details";
  return `${expanded ? "Collapse" : "Expand"} ${target}`;
}

/**
 * The disclosure chevron — decorative; the toggle `<button>` around it carries
 * the semantics. Points down when expanded and rotates to point right when
 * collapsed (driven by `data-expanded`), mirroring `Accordion`.
 */
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
  /**
   * The id of the panel this toggle controls, while open. Group toggles omit it
   * — they show/hide rows in place, with no single element to point at.
   */
  "aria-controls"?: string;
}

/**
 * The bare, focusable disclosure button shared by the group-header and row
 * detail-panel toggles — button chrome, focus ring, and rotating
 * {@link ChevronGlyph} in one place. Semantics are supplied per use.
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
