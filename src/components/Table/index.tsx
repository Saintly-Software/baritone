"use client";
import * as React from "react";
import { cx } from "../../utils/cx";
import { cell as cellRecipe, tableCaption, tableRoot } from "./table.css";

/** Horizontal alignment of a column's header and body cells. */
export type TableAlign = "start" | "center" | "end";

/**
 * The value carried by any cell of a plain `Table`. Rows are plain data whose
 * every field is rendered as-is, so a value is anything React can render — a
 * string, a number, an element. (The typed-accessor `DataTable`, built on
 * TanStack, is the tool when a column needs to know its value is a `number` and
 * format it; this plain table trades that for a strict row-key contract.)
 */
export type TableValue = React.ReactNode;

/**
 * A single column. `key` is the row property this column reads — the set of
 * `key`s across the columns is the table's contract: {@link Table} infers it and
 * rejects any row that omits one of these keys or carries a key no column reads.
 *
 * `Key` is the union of every column's key when a column is seen through
 * `Table`'s `columns` prop, so `cell`'s `row` argument is the whole row rather
 * than just this column's own field.
 */
export interface TableColumn<Key extends string = string> {
  /** The row property this column reads and renders. Unique across the columns. */
  key: Key;
  /** The header cell (`<th>`) content. Omit for a column with a blank header. */
  header?: React.ReactNode;
  /** Horizontal alignment of this column's header and body cells. Default `start`. */
  align?: TableAlign;
  /**
   * Render this column's body cells. Receives the row's value at `key` and the
   * whole row. Without it, the raw value at `key` is rendered directly.
   *
   * @example
   * { key: "email", header: "Email",
   *   cell: (value) => <Link href={`mailto:${value}`}>{value}</Link> }
   */
  cell?: (value: TableValue, row: Record<Key, TableValue>) => React.ReactNode;
}

/**
 * The row shape a set of columns implies: exactly one field per column `key`,
 * each holding a renderable {@link TableValue}. This is what {@link Table}
 * requires every row to match — the type that makes an unmapped key, or a
 * missing one, a compile error.
 */
export type TableRowFor<Columns extends readonly TableColumn[]> = Record<
  Columns[number]["key"],
  TableValue
>;

/**
 * Validate one row against the shape its columns imply. A row with a key no
 * column maps resolves to a shape whose extra keys are typed `never`, so the
 * offending value fails to assign (`… is not assignable to type 'never'`); a row
 * missing a key fails the `extends` and surfaces as the usual "property is
 * missing" error. An exactly-matching row passes through unchanged.
 */
type ExactRow<Row, Shape> = Row extends Shape
  ? Exclude<keyof Row, keyof Shape> extends never
    ? Row
    : Shape & Record<Exclude<keyof Row, keyof Shape>, never>
  : Shape;

/**
 * The props of {@link Table}, generic over the column-key union `K` (inferred
 * from `columns`) and the concrete row tuple `Rows` (inferred from `rows`).
 *
 * `rows` is typed as a per-element {@link ExactRow} check against
 * `Record<K, TableValue>`: the `NoInfer` keeps `rows` from widening `K` back to
 * `string`, so `K` stays the exact set of column keys while each row is still
 * checked as its own literal — that pairing is what makes the row contract
 * strict in both directions.
 */
export interface TableProps<
  K extends string,
  Rows extends readonly Record<string, TableValue>[],
> extends Omit<React.TableHTMLAttributes<HTMLTableElement>, "children"> {
  /**
   * The columns, in render order. Their `key`s define the row contract; give
   * each a `header`, an optional `align`, and an optional `cell` renderer.
   */
  columns: readonly TableColumn<K>[];
  /**
   * The rows, in render order. Every row must have exactly the keys the columns
   * declare — no more (an unmapped key is a type error), no fewer (a missing key
   * is a type error).
   */
  rows: readonly [...{ [I in keyof Rows]: ExactRow<Rows[I], NoInfer<Record<K, TableValue>>> }];
  /**
   * The table's visible title, rendered as a `<caption>` (which also names the
   * table for assistive tech). Omit it for an untitled table; pass `aria-label`
   * or `aria-labelledby` (forwarded to the `<table>`) to name one without a
   * visible caption.
   */
  caption?: React.ReactNode;
  /**
   * Derive a stable React key for each row (e.g. `(row) => row.id`). Defaults to
   * the row's index; supply it whenever rows can reorder or change, so keys stay
   * pinned to the row rather than its position.
   */
  getRowKey?: (row: Record<K, TableValue>, index: number) => React.Key;
  ref?: React.Ref<HTMLTableElement>;
}

// The runtime body reads columns/rows through this widened shape — the generics
// exist only to type the call site, so the implementation works one concrete
// (string-keyed) row shape without re-narrowing on every field access.
type TableRuntimeProps = Omit<TableProps<string, readonly Record<string, TableValue>[]>, "rows"> & {
  rows: ReadonlyArray<Record<string, TableValue>>;
};

/**
 * Table — renders a set of `columns` and `rows` as a plain, semantic
 * `<table>`: a `<thead>` of column headers and a `<tbody>` of rows, no sorting,
 * filtering, or pagination. Reach for {@link DataTable} when you need those; use
 * `Table` when the data is ready to show as-is.
 *
 * The columns are the contract. `Table` infers the union of their `key`s and
 * types `rows` against it, so a row that carries a key no column maps — or omits
 * one a column needs — is a compile error. Cell values are plain
 * {@link TableValue}s (rendered as-is); a column's `cell` can wrap its value in
 * any element.
 *
 * @example
 * <Table
 *   caption="Team members"
 *   columns={[
 *     { key: "name", header: "Name" },
 *     { key: "role", header: "Role" },
 *     { key: "balance", header: "Balance", align: "end" },
 *   ]}
 *   rows={[
 *     { name: "Ada Lovelace", role: "Engineering", balance: "$4,200" },
 *     { name: "Alan Turing", role: "Research", balance: "$1,875" },
 *   ]}
 * />
 */
export function Table<
  const K extends string,
  const Rows extends readonly Record<string, TableValue>[],
>(props: TableProps<K, Rows>) {
  const { columns, rows, caption, getRowKey, className, ref, ...rest } =
    props as unknown as TableRuntimeProps;

  return (
    <table ref={ref} className={cx(tableRoot, className)} {...rest}>
      {caption != null && <caption className={tableCaption}>{caption}</caption>}
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className={cellRecipe({ header: true, align: column.align ?? "start" })}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={getRowKey ? getRowKey(row, index) : index}>
            {columns.map((column) => (
              <td key={column.key} className={cellRecipe({ align: column.align ?? "start" })}>
                {column.cell ? column.cell(row[column.key], row) : row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

Table.displayName = "Table";
