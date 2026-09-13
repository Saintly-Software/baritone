"use client";
import * as React from "react";
import { cx } from "../../utils/cx";
import { cell as cellRecipe, tableCaption, tableRoot } from "./table.css";

/** Horizontal alignment of a column's header and body cells. */
export type TableAlign = "start" | "center" | "end";

const isDev = (): boolean =>
  typeof process === "undefined" || process.env.NODE_ENV !== "production";

/** The value carried by any cell of a plain `Table` — anything React can render. */
export type TableValue = React.ReactNode;

/**
 * A single column. `key` is the row property this column reads; the set of `key`s
 * across the columns is the table's row contract. `Key` is the union of every
 * column's key, so `cell`'s `row` argument is the whole row.
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
 * The row shape a set of columns implies: one field per column `key`, each a
 * renderable {@link TableValue}. What {@link Table} requires every row to match.
 */
export type TableRowFor<Columns extends readonly TableColumn[]> = Record<
  Columns[number]["key"],
  TableValue
>;

/**
 * Validate one row against the shape its columns imply. An unmapped key resolves
 * to a `never`-typed field (the value fails to assign); a missing key fails the
 * `extends`. An exactly-matching row passes through unchanged.
 */
type ExactRow<Row, Shape> = Row extends Shape
  ? Exclude<keyof Row, keyof Shape> extends never
    ? Row
    : Shape & Record<Exclude<keyof Row, keyof Shape>, never>
  : Shape;

/**
 * The props of {@link Table}, generic over the column-key union `K` (inferred
 * from `columns`) and the row tuple `Rows` (inferred from `rows`). `rows` is a
 * per-element {@link ExactRow} check against `Record<K, TableValue>`, with
 * `NoInfer` keeping `K` from widening back to `string`, so the row contract is
 * strict in both directions. `Rows` is bounded by `readonly object[]` (not a
 * `Record`) so an interface-backed row type like `Person[]` is accepted.
 */
export interface TableProps<K extends string, Rows extends readonly object[]> extends Omit<
  React.TableHTMLAttributes<HTMLTableElement>,
  "children"
> {
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
   * The table's visible title, rendered as a `<caption>`. Omit for an untitled
   * table; pass `aria-label` / `aria-labelledby` to name one without a caption.
   */
  caption?: React.ReactNode;
  /**
   * Derive a stable React key for each row (e.g. `(row) => row.id`). Defaults to
   * the row index; supply it whenever rows can reorder.
   */
  getRowKey?: (row: Record<K, TableValue>, index: number) => React.Key;
  ref?: React.Ref<HTMLTableElement>;
}

type TableRuntimeProps = Omit<TableProps<string, readonly Record<string, TableValue>[]>, "rows"> & {
  rows: ReadonlyArray<Record<string, TableValue>>;
};

/**
 * Renders `columns` and `rows` as a plain, semantic `<table>` — no sorting,
 * filtering, or pagination (reach for {@link DataTable} when you need those). The
 * columns are the contract: `Table` types `rows` against the union of their
 * `key`s, so an unmapped or missing key is a compile error. A column's `cell` can
 * wrap its value in any element.
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
export function Table<const K extends string, const Rows extends readonly object[]>(
  props: TableProps<K, Rows>,
) {
  const { columns, rows, caption, getRowKey, className, ref, ...rest } =
    props as unknown as TableRuntimeProps;

  if (isDev()) {
    const names = [
      caption != null && "caption",
      rest["aria-label"] != null && "aria-label",
      rest["aria-labelledby"] != null && "aria-labelledby",
    ].filter((v): v is string => typeof v === "string");
    if (names.length > 1) {
      throw new Error(
        `[baritone] Table: \`${names.join("`, `")}\` are mutually exclusive — pass at most ` +
          "one. `aria-label`/`aria-labelledby` override the visible `caption` in the accessible " +
          "name, so the table would show one name and announce another.",
      );
    }
  }

  return (
    <table ref={ref} className={cx(tableRoot, className)} {...rest}>
      {caption != null && <caption className={tableCaption}>{caption}</caption>}
      <thead>
        <tr>
          {columns.map((column, columnIndex) => (
            <th
              key={columnIndex}
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
            {columns.map((column, columnIndex) => (
              <td key={columnIndex} className={cellRecipe({ align: column.align ?? "start" })}>
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
