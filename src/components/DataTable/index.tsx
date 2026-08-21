"use client";
import {
  aggregationFns,
  type ColumnDef,
  columnGroupingFeature,
  createColumnHelper,
  createExpandedRowModel,
  createGroupedRowModel,
  flexRender,
  type RowData,
  rowAggregationFeature,
  rowExpandingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import * as React from "react";
import { focusRingRecipe } from "../../styles/recipes/focusRing.css";
import { cx } from "../../utils/cx";
import {
  cell as cellRecipe,
  dataTableCaption,
  dataTableRoot,
  groupChevron,
  groupCount,
  groupDepthVar,
  groupLabel,
  groupRow,
  groupToggle,
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
}

/**
 * The feature set every DataTable runs with. Core plus the grouping stack —
 * `columnGroupingFeature` (group state + grouped/aggregated cell APIs),
 * `rowExpandingFeature` (collapse/expand the groups), and `rowAggregationFeature`
 * (so a column's `aggregationFn` / `aggregatedCell` compute per group) — with
 * their two row-model slots. Sorting / filtering / pagination are further v9
 * plugins we can register here later. React's `useTable` injects its own
 * reactivity feature on top of this.
 *
 * The features are always registered; with no `grouping` the grouped row model
 * is a pass-through, so a plain table pays nothing behaviourally. The
 * `columnMeta` slot is phantom at runtime (its value is stripped); only its type
 * is used, to type `columnDef.meta` as {@link DataTableColumnMeta}.
 */
export const dataTableFeatures = tableFeatures({
  columnMeta: {} as DataTableColumnMeta,
  columnGroupingFeature,
  rowExpandingFeature,
  rowAggregationFeature,
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
   * (later) row selection stay pinned to the row, not its position.
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

// Dev/test only, matching `Table` and Field's `assertExclusiveNames`: the naming
// check is deterministic on props, so any render in dev/test/CI trips it long
// before production — and the whole guard dead-code-eliminates out of the bundle.
const isDev = (): boolean =>
  typeof process === "undefined" || process.env.NODE_ENV !== "production";

/**
 * DataTable — renders a set of columns and rows as a semantic `<table>`, built on
 * TanStack React Table v9 (headless: it owns the row/column model; we own the
 * markup, styles, and a11y). Renders the columns you pass and, when `grouping` is
 * set, collapsible group-header rows; sorting / filtering / pagination are v9
 * features we can layer on later without changing this surface.
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
    empty,
    caption,
    className,
    ref,
    ...rest
  } = props as DataTableBaseProps<TData> & {
    // `caption` and the aria names are pulled from the `DataTableName` union onto
    // one runtime shape: `caption` renders as a `<caption>`, while `aria-label` /
    // `aria-labelledby` stay in `rest` to forward onto the `<table>` and to feed
    // the dev-only exclusivity check below.
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

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    getRowId,
    state: { grouping: groupingState },
    // Seed the internally-owned expansion; `true` opens every group, `{}` starts
    // them all collapsed. Read once (initial state), so recomputing it is fine.
    initialState: { expanded: defaultExpanded === false ? {} : true },
    // Keep the author's column order — don't hoist grouped columns to the front.
    groupedColumnMode: false,
  });

  const rows = table.getRowModel().rows;
  const leafColumnCount = table.getAllLeafColumns().length;

  return (
    <table ref={ref} className={cx(dataTableRoot, className)} {...rest}>
      {caption != null && <caption className={dataTableCaption}>{caption}</caption>}
      <thead>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
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
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {rows.length === 0 && empty != null ? (
          <tr>
            <td
              colSpan={leafColumnCount > 0 ? leafColumnCount : undefined}
              className={cellRecipe({ align: "center" })}
            >
              {empty}
            </td>
          </tr>
        ) : (
          rows.map((row) => {
            const isGroupRow = row.getIsGrouped();
            return (
              <tr key={row.id} className={isGroupRow ? groupRow : undefined}>
                {row.getAllCells().map((cell) => {
                  const align = cell.column.columnDef.meta?.align ?? "start";

                  let content: React.ReactNode;
                  if (cell.getIsGrouped()) {
                    // The grouping cell: expand/collapse toggle, the group's value
                    // (through the column's own `cell`, so formatting matches the
                    // body), then the number of data rows it holds. Indented by depth
                    // so nested groups step inward.
                    const expanded = row.getIsExpanded();
                    // Count underlying data rows, not immediate children: with a
                    // second grouping column `subRows` are sub-groups, so we flatten
                    // to the leaves and drop the intermediate group rows.
                    const dataRowCount = row.getLeafRows().filter((r) => !r.getIsGrouped()).length;
                    content = (
                      <span
                        className={groupLabel}
                        style={assignInlineVars({ [groupDepthVar]: String(row.depth) })}
                      >
                        <button
                          type="button"
                          onClick={row.getToggleExpandedHandler()}
                          aria-expanded={expanded}
                          aria-label={`${expanded ? "Collapse" : "Expand"} ${groupRowLabel(row)}`}
                          className={cx(
                            groupToggle,
                            focusRingRecipe({ type: "visible", offset: "sm" }),
                          )}
                        >
                          <ChevronGlyph expanded={expanded} />
                        </button>
                        <span>
                          <table.FlexRender cell={cell} />
                        </span>
                        <span className={groupCount}>({dataRowCount})</span>
                      </span>
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
            );
          })
        )}
      </tbody>
    </table>
  );
}

DataTable.displayName = "DataTable";

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
 * The group disclosure chevron — decorative; the toggle `<button>` around it
 * carries the semantics. Points down when the group is expanded and rotates to
 * point right when collapsed (driven by `data-expanded`), mirroring `Accordion`.
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
