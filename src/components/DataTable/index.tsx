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
 * DataTable's column meta — house presentational options layered onto a TanStack
 * column through its `meta` slot, rather than a parallel column API. Wired as a
 * v9 type-only `columnMeta` feature slot (see {@link dataTableFeatures}), so
 * `columnDef.meta` is typed as this and nothing else.
 */
export interface DataTableColumnMeta {
  /** Horizontal alignment of the column's header and body cells. Default `start`. */
  align?: "start" | "center" | "end";
  /**
   * In `groupDisplay="merge"`, marks this column as the host for the merged group
   * label — the column whose cells carry the group value + toggle + count on
   * header rows and the row's own value (indented by depth) on leaf rows. At most
   * one column should set it; a grouped column may (it then stays visible as the
   * outline instead of being dropped). If none set it, the first non-grouped,
   * non-aggregated column hosts the label. Ignored under the default
   * `groupDisplay="columns"`.
   */
  groupLabel?: boolean;
}

/**
 * The feature set every DataTable runs with. Core plus the grouping stack —
 * `columnGroupingFeature` (group state + grouped/aggregated cell APIs),
 * `rowExpandingFeature` (collapse/expand the groups), and `rowAggregationFeature`
 * (so a column's `aggregationFn` / `aggregatedCell` compute per group) — with
 * their two row-model slots, plus `rowSelectionFeature` (the `rowSelection` state
 * and per-row / select-all APIs behind the checkbox column). Sorting / filtering
 * / pagination are further v9 plugins we can register here later. React's
 * `useTable` injects its own reactivity feature on top of this.
 *
 * The features are always registered; with no `grouping` the grouped row model
 * is a pass-through, and with selection off (`enableRowSelection` unset) the
 * selection option is forced `false`, so a plain table pays nothing
 * behaviourally. The `columnMeta` slot is phantom at runtime (its value is
 * stripped); only its type is used, to type `columnDef.meta` as
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
  // The built-in aggregation registry, so a column's `aggregationFn: "sum"`
  // (etc.) resolves by name; v9 doesn't auto-register these. `"auto"` and inline
  // `AggregationFnDef`s work without it, but the named built-ins are the DX we want.
  aggregationFns,
});

/** The feature set's type — the first type argument to every `ColumnDef` / column helper below. */
export type DataTableFeatures = typeof dataTableFeatures;

/**
 * A DataTable column definition — a TanStack `ColumnDef` bound to DataTable's
 * feature set. Build these with {@link createDataTableColumnHelper} (recommended,
 * for per-column value inference) or as plain objects.
 *
 * `TValue` is `any` for the same reason TanStack's own `columnHelper.columns()`
 * returns `ColumnDef<…, any>[]`: a table's columns are heterogeneous — each has
 * its own value type — and `any` is what lets them share one array. Columns
 * authored through the helper stay individually type-checked; the widening is
 * only at this array boundary.
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
   * The rows to render. Keep this reference stable across renders (component
   * state, `useMemo`, or a query result) — a fresh array every render throws
   * away TanStack's memoised row model.
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
   * Column ids to group rows by, applied in order — group by the first id, then
   * by the second within each group, and so on. Each id must match a column's id
   * (an `accessor` column's id is its key unless you set one). Omit or pass `[]`
   * for a flat table.
   *
   * Grouping inserts a collapsible header row per distinct value, carrying the
   * group's label, its row count, and an expand/collapse toggle. Columns with an
   * `aggregationFn` (and optional `aggregatedCell`) show a rolled-up value on
   * those header rows. This is a controlled input: the table renders whatever you
   * pass — drive it from a "group by" control or a static config — and owns only
   * the expanded/collapsed state (see `defaultExpanded`).
   */
  grouping?: ReadonlyArray<string>;
  /**
   * Whether groups start expanded. Defaults to `true` (every group open). Set
   * `false` to start fully collapsed. Only seeds the initial render — the table
   * owns expansion after that, toggled per group; changing this later won't
   * re-collapse an open table.
   */
  defaultExpanded?: boolean;
  /**
   * How grouped rows present, when `grouping` is set. Default `"columns"`.
   *
   * - `"columns"`: the grouped column stays its own column — group-header rows
   *   carry the label there and leaf rows leave it blank (a placeholder). The
   *   original layout.
   * - `"merge"`: the grouped column(s) are not rendered as their own columns.
   *   Instead the group label (value + toggle + count) is hosted in one column,
   *   indented by nesting depth, and leaf rows render that column's own value
   *   indented to match — a single outline column instead of a blank leftmost one.
   *   The host is the column whose `meta.groupLabel` is `true`, else the first
   *   column that is neither grouped nor aggregated (so an aggregated total keeps
   *   rolling up per group rather than being replaced by the label); if every
   *   remaining column aggregates, the innermost grouped column stays on as the
   *   outline. Set the host column's `header` to name the outline (e.g.
   *   `"Category"`). Inert without `grouping`.
   *
   * `"merge"` assumes flat columns. It drops a grouped leaf at render time
   * without touching column-visibility state, so a grouped leaf nested inside a
   * column group leaves that group's parent header at its original `colSpan` —
   * wider than the body. Use `"columns"` when your columns are nested under group
   * headers.
   */
  groupDisplay?: "columns" | "merge";
  /**
   * Turn on row selection: a leading checkbox column with a "select all" box in
   * the header and a checkbox per row. Pass `true` to make every row selectable,
   * or a predicate `(row) => boolean` to allow it only for some (the rest render
   * a disabled box). Omit for no selection column at all.
   *
   * Strongly pair with a stable {@link getRowId} — selection is tracked by id, so
   * without one it pins to the row *index* and mis-tracks when the data reorders.
   * When `grouping` is on, each group header also gets a tri-state box that
   * selects or clears its rows in one click.
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
   * Called after a selection change with the selected row ids and the matching
   * rows from the current `data`. Fires in both controlled and uncontrolled
   * modes. The ids are the source of truth — prefer them for persistence, since a
   * selected id can outlive a row that's been paged or filtered out of `data`.
   */
  onSelectionChange?: (selectedRowIds: string[], selectedRows: TData[]) => void;
  /**
   * Render an expandable detail panel for a row. When provided, each data row
   * grows a leading disclosure toggle; clicking it reveals a full-width panel
   * beneath the row containing whatever this returns — called with the row's own
   * datum, so `(row) => <RowDetails person={row} />` is the shape. It runs only
   * for open rows (never eagerly for collapsed ones), so an expensive panel costs
   * nothing until it's opened.
   *
   * Panels start collapsed and toggle independently; the table owns that
   * expanded/collapsed state. Every data row is expandable by default — narrow
   * that with {@link enableRowExpansion} to show a toggle on only some rows.
   * Group-header rows keep their own toggle and never get a detail toggle. Omit
   * for no expansion column at all, so an existing `DataTable` is unchanged. Pair
   * with a stable {@link getRowId} so an open panel stays pinned to its row when
   * `data` reorders.
   */
  renderDetailPanel?: (row: TData) => React.ReactNode;
  /**
   * Gate which rows can expand, when {@link renderDetailPanel} is set. Pass `true`
   * (the default) to let every data row expand, a predicate `(row) => boolean` to
   * allow it only for some — the rest render no toggle, just an empty expander cell
   * so the column still lines up — or `false` to turn the feature off entirely,
   * dropping the expander column even though `renderDetailPanel` is provided (handy
   * for flagging it on and off without threading `renderDetailPanel` through a
   * conditional). Mirrors {@link enableRowSelection}'s shape. Ignored without
   * `renderDetailPanel`; group-header rows are never gated by it.
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
 * Stable empty grouping, shared by every ungrouped table. A fresh `[]` each
 * render would churn the controlled `grouping` state (and its derived row model)
 * on every pass; one frozen module-scope array keeps the reference steady.
 */
const NO_GROUPING: string[] = [];

/**
 * Shared empty set for the "no columns hidden" case (the default `"columns"`
 * presentation, and `"merge"` before any `grouping` is set) — one module-scope
 * value, so the non-merge path allocates nothing per render.
 */
const EMPTY_SET: ReadonlySet<string> = new Set();

// Dev/test only, matching `Table` and Field's `assertExclusiveNames`: the naming
// check is deterministic on props, so any render in dev/test/CI trips it long
// before production — and the whole guard dead-code-eliminates out of the bundle.
const isDev = (): boolean =>
  typeof process === "undefined" || process.env.NODE_ENV !== "production";

/**
 * DataTable — renders a set of columns and rows as a semantic `<table>`, built on
 * TanStack React Table v9 (headless: it owns the row/column model; we own the
 * markup, styles, and a11y). Renders the columns you pass and, when `grouping` is
 * set, collapsible group-header rows; with `enableRowSelection` it grows a
 * leading checkbox column, and with `renderDetailPanel` a leading expander column
 * whose toggle reveals a full-width detail panel beneath the row. Sorting /
 * filtering / pagination are v9 features we can layer on later without changing
 * this surface.
 *
 * Pass `data` and `columns` (build columns with {@link createDataTableColumnHelper}),
 * and name the table with `caption`, `aria-label`, or `aria-labelledby`. Set a
 * column's alignment through its `meta.align`.
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
 * // `groupDisplay="merge"`: a single indented outline column. Group by Category,
 * // list Subcategory rows in that same first column, and keep a summed Amount.
 * // The grouped `category` column isn't rendered on its own; set the host
 * // column's `header` ("Category") to name the outline.
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
  // `props` is a union over the naming arms; widen to a single shape to read the
  // fields. `caption` is pulled out to render as a `<caption>`; `aria-label` /
  // `aria-labelledby` are intentionally left in `rest` so they forward onto the
  // `<table>` (they're mutually exclusive with `caption` via the union).
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

  // A visible `caption` and an `aria-label`/`aria-labelledby` name the table
  // twice, and the aria value wins in the accessible name — so the table would
  // show one name and announce another. The `DataTableName` union already makes
  // this a type error, but reject it in dev for JS callers and type-casts too,
  // mirroring `Table` and Field's `assertExclusiveNames` (a name mismatch is an
  // a11y bug, not a condition to degrade through).
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
  // so passing the prop through (defaulting to a stable empty array so the ref
  // is steady across renders) is enough — no `onGroupingChange` owner needed.
  // `state.grouping` wants a mutable `string[]`; the cast is safe because
  // TanStack treats state as read-only.
  const groupingState = (grouping ?? NO_GROUPING) as string[];

  // Selection is on whenever `enableRowSelection` is set (a `true` or a
  // predicate); `false`/omitted leaves the whole column off and forces the table
  // option `false` so no row is even implicitly selectable.
  const selectionEnabled = enableRowSelection !== undefined && enableRowSelection !== false;
  // Controlled when the consumer owns `selectedRowIds`; otherwise the table keeps
  // its own selection, seeded once from `defaultSelectedRowIds` (mirrors
  // `ToggleButton`'s controlled/uncontrolled split).
  const isSelectionControlled = selectedRowIds !== undefined;
  const [internalSelection, setInternalSelection] = React.useState<RowSelectionState>(() =>
    idsToRowSelection(defaultSelectedRowIds),
  );
  // TanStack's selection map (`Record<id, true>`). In controlled mode it's derived
  // from `selectedRowIds` (memoised on the array so the reference is stable when
  // the ids are); otherwise it's the internally-owned state.
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

  // Group-header rows aren't independently selectable (their box drives their
  // children instead), so only real data rows ever enter the selection map — its
  // keys are exactly the selected data ids. Memoised on `enableRowSelection`, so
  // its identity is stable exactly when that prop is (a boolean, or a predicate
  // the consumer keeps stable) — an inline predicate still changes each render and
  // re-invalidates TanStack's selection memos. We deliberately key on it (rather
  // than a latest-ref) so a changed predicate *does* re-evaluate selectability.
  const rowCanSelect = React.useCallback(
    (row: Row<DataTableFeatures, TData>): boolean => {
      if (row.getIsGrouped()) return false;
      return typeof enableRowSelection === "function" ? enableRowSelection(row.original) : true;
    },
    [enableRowSelection],
  );

  // Bridge TanStack's `Record<id, true>` updater to the public `string[]` API:
  // resolve the next map, commit it locally when uncontrolled, and notify the
  // consumer with the ids and their rows either way.
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

  // Row detail panels. Kept in the table's *own* state — deliberately separate
  // from TanStack's `state.expanded`, which the grouping stack seeds to `true`
  // (every group open). Routing detail rows through that same state would make
  // `true` read as "every detail panel open" on the first render; a dedicated set
  // of expanded row ids instead starts empty (all collapsed) and never touches
  // group expansion. Uncontrolled, mirroring group expansion; seeded from the
  // shared empty set so a table without panels allocates nothing.
  //
  // The feature is on when a renderer is given and `enableRowExpansion` isn't a
  // hard `false` — matching how `enableRowSelection: false` fully disables
  // selection, so a flag can drop the expander column without unwiring the
  // renderer. `!= null` (not `!== undefined`) mirrors the other optional render
  // props (`empty`, `caption`), so an explicit `renderDetailPanel={null}` from a
  // JS caller disables the feature too, rather than rendering empty panels.
  const detailEnabled = renderDetailPanel != null && enableRowExpansion !== false;
  // Which rows may expand — mirrors `rowCanSelect`, minus its `useCallback`: this
  // one is only ever called inline in the row map (nothing memoises on its
  // identity, unlike `rowCanSelect`, which `useTable` reads), so a plain function
  // is enough. A predicate gates per row; a bare `true`/omitted opens every row
  // (group rows are excluded at the call site, where `isGroupRow` is in hand).
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
  // Scope the panels' ids to this table instance so two tables on one page don't
  // collide. Keyed off the row's render position, not `row.id`: a `getRowId` may
  // return arbitrary strings (e.g. a composite name key with spaces), which would
  // make an invalid DOM `id` and break `aria-controls` (a space-separated IDREF
  // list) silently. The index is always a whitespace-free, per-table-unique token,
  // and toggle + panel are rendered in the same iteration so they always agree.
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
    // Selection: `false` when off keeps the feature fully inert; otherwise the
    // per-row predicate gates individual rows. We own `state.rowSelection`, so the
    // change handler feeds the resolved map back (controlled) or into local state.
    enableRowSelection: selectionEnabled ? rowCanSelect : false,
    onRowSelectionChange: handleRowSelectionChange,
  });

  const rows = table.getRowModel().rows;

  // Merge presentation only kicks in once there's something to group — with no
  // `grouping` there are no group rows, so a "merge" table is byte-for-byte the
  // plain table, and none of the column-dropping below runs.
  const merge = groupDisplay === "merge" && groupingState.length > 0;

  const groupingSet = merge ? new Set(groupingState) : EMPTY_SET;
  const leafColumns = table.getAllLeafColumns();

  // Pick the column that hosts the merged group label. In priority order:
  //  1. an explicit `meta.groupLabel` opt-in — any column, even a grouped one;
  //  2. else the first column that is neither grouped nor aggregated, so a column
  //     with an `aggregationFn` keeps showing its per-group total instead of being
  //     taken over by the label;
  //  3. else the innermost grouped column itself, kept visible as the outline —
  //     reached when every non-grouped column aggregates, or when *every* column
  //     is grouped (so there's still a host, never a row of zero cells).
  // `merge` guarantees at least one grouped column, so a host always exists.
  // Computed inline (not memoised) so it can't drift from `columns`/`meta` while
  // `grouping` holds steady.
  let hostColumnId: string | undefined;
  if (merge) {
    const aggregatedIds = collectAggregatedIds(columns);
    const explicit = leafColumns.find((c) => c.columnDef.meta?.groupLabel === true);
    const firstPlain = leafColumns.find((c) => !groupingSet.has(c.id) && !aggregatedIds.has(c.id));
    const grouped = leafColumns.filter((c) => groupingSet.has(c.id));
    const innermostGrouped = grouped[grouped.length - 1];
    hostColumnId = (explicit ?? firstPlain ?? innermostGrouped)?.id;
  }

  // The grouped columns are dropped from the layout in merge mode — all except the
  // one hosting the label, which stays on as the outline column. We keep
  // TanStack's `groupedColumnMode: false` and filter here at render time, so the
  // row model, aggregation, and (crucially) the grouped cell's own renderer stay
  // intact and the host can format the group value through that column's `cell`.
  const isHidden = (columnId: string): boolean =>
    merge && groupingSet.has(columnId) && columnId !== hostColumnId;

  const leafColumnCount = leafColumns.filter((c) => !isHidden(c.id)).length;
  const headerGroups = table.getHeaderGroups();
  // The leading utility columns (selection box, detail expander), when present,
  // each add one leaf to the grid — fold them into the empty-state and
  // detail-panel `colSpan` so those cells still span the full width.
  const totalColumnCount = leafColumnCount + (selectionEnabled ? 1 : 0) + (detailEnabled ? 1 : 0);
  // Whether any row can actually be selected. With a predicate that excludes
  // every row (or no rows at all), the "select all" box would be a focusable
  // no-op, so lock it — mirroring the per-group box's `groupHasSelectableLeaves`.
  const hasSelectableRows =
    selectionEnabled && table.getFilteredRowModel().flatRows.some((row) => row.getCanSelect());

  // The group-label cluster — expand/collapse toggle, the group's value, and its
  // data-row count — indented by the row's depth. Shared by both presentations:
  // in `"columns"` mode it fills the grouped column's own cell, in `"merge"` mode
  // the host column's cell on a group-header row. `valueNode` is the group value
  // already rendered through the grouped column's `cell`, so formatting matches
  // the body either way. A plain render helper (not a nested component) so it
  // closes over `table`/state without remounting.
  const renderGroupLabel = (row: (typeof rows)[number], valueNode: React.ReactNode) => {
    const expanded = row.getIsExpanded();
    // Count underlying data rows, not immediate children: with a second grouping
    // column `subRows` are sub-groups, so we flatten to the leaves and drop the
    // intermediate group rows.
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
            {/* The expander column's header — a spacer over the per-row toggles,
                named for screen-reader table navigation (it has no visible text).
                On a multi-row header it spans every header row via `rowSpan`,
                rendered only once. */}
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
                  // `getIsSomePageRowsSelected` counts only selectable rows in the
                  // model, so a lingering id that no longer maps to a row (the
                  // selection contract keeps those) can't fake a mixed header.
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
            // toggled — and `getIsAllSubRowsSelected` reports "all" for an empty
            // selectable set — so lock its box instead of showing a checked no-op.
            const groupHasSelectableLeaves =
              isGroupRow && row.getLeafRows().some((leaf) => leaf.getCanSelect());
            // Detail panels open only for expandable data rows — a group header
            // (its own toggle) and a row the predicate excludes both keep an empty
            // expander cell, so the columns still line up.
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
                        // A data row's box. `getToggleSelectedHandler` gets the raw
                        // change event, so Shift-click range selection works; a
                        // non-selectable row (per the predicate) shows a locked box.
                        // Gate `checked` on `getCanSelect` too: a stale/seeded id for
                        // a now-unselectable row stays in the selection map, but its
                        // locked box must never read as checked (it can't be cleared).
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
                      // The group label: expand/collapse toggle, the group's value,
                      // and its data-row count, indented by depth. In `"columns"`
                      // mode this *is* the grouped column's cell; in `"merge"` mode
                      // it's the host cell on a group-header row, and the value is
                      // taken from this row's grouped cell so formatting still runs
                      // through the grouped column's own `cell`.
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
                      // Merge mode, leaf row: the host column's own value, indented
                      // to sit one level in from its group header so the outline
                      // lines up.
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
   * focusable and announce `aria-disabled` — never the native `disabled`
   * attribute, which drops it from the tab order (the house convention; see
   * AGENTS.md). base-ui's own `Checkbox` models disabled the same way.
   */
  readOnly?: boolean;
  /** Toggle handler; receives the raw change event (Shift state included). */
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  /** Accessible name — the box carries no visible label. */
  "aria-label": string;
}

/**
 * The checkbox in a selection cell: a real, focusable `<input type="checkbox">`
 * (state, keyboard, accessible name) laid transparently over the presentational
 * {@link InternalCheckbox} (the look, including the focus ring and the mixed
 * dash). A native checkbox can only show "mixed" through the DOM `indeterminate`
 * property — there's no attribute — so it's set from a ref whenever it changes.
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
 * The ids of columns the author gave a per-group aggregate — those with an
 * explicit `aggregationFn` or `aggregatedCell` in the column defs they passed.
 * Used to keep such a column from becoming the default merged-label host (which
 * would swallow its total).
 *
 * Read off the *authored* defs, not the resolved `column.columnDef`: v9 fills in
 * a default `aggregationFn: "auto"` and a default `aggregatedCell` on every
 * resolved column, so the resolved shape can't tell an intended aggregate from a
 * plain column. Recurses into group columns' `columns`; a leaf's id is its
 * explicit `id`, else its `accessorKey` (matching how the table derives it).
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
 * A row's own descriptive value — its first cell carrying a usable primitive
 * (typically the name/label column, but skipping a leading display/empty cell) —
 * used to give a per-row control an unambiguous name. Returns `undefined` when no
 * cell has a sensible string form (all empty, object-, or function-valued), so
 * the caller can supply its own generic fallback.
 *
 * Skips grouped and placeholder cells: under grouping, the grouped column's cell
 * carries the *group's* value (shared by every row in the group), so using it
 * would give every row's control the same name. Skipping it falls through to the
 * row's own first distinguishing value instead.
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
 * The accessible name for a data row's selection box. A bare "Select row" is
 * ambiguous when every row shares it, so lead with the row's descriptive value
 * (via {@link rowPrimaryValue}) — mirroring the group box's `Select all rows in
 * <value>` — falling back to "Select row" when the row has no usable value.
 */
function rowSelectLabel<TData extends RowData>(row: Row<DataTableFeatures, TData>): string {
  const value = rowPrimaryValue(row);
  return value != null ? `Select ${value}` : "Select row";
}

/**
 * The accessible name for a row's detail-panel toggle — "Expand"/"Collapse"
 * (reflecting the current state, matching the group toggle) followed by the row's
 * descriptive value (via {@link rowPrimaryValue}), e.g. "Expand details for Ada
 * Lovelace". Falls back to a generic "row details" when the row has no usable value.
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
   * The id of the panel this toggle controls, when one is in the DOM (the detail
   * panel, while open). Group toggles omit it — they show/hide rows in place, with
   * no single controlled element to point at.
   */
  "aria-controls"?: string;
}

/**
 * The bare, focusable disclosure button shared by the group-header toggle and the
 * row detail-panel toggle — the button chrome, focus-ring pairing, and rotating
 * {@link ChevronGlyph} in one place so the two can't drift. The semantics
 * (`onClick`, name, optional `aria-controls`) are supplied per use.
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
