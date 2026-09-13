"use client";
import * as React from "react";
import { cx } from "../../utils/cx";
import { cell as cellRecipe, tableCaption, tableRoot } from "./table.css";

export type TableAlign = "start" | "center" | "end";

const isDev = (): boolean =>
  typeof process === "undefined" || process.env.NODE_ENV !== "production";

export type TableValue = React.ReactNode;

export interface TableColumn<Key extends string = string> {
  key: Key;

  header?: React.ReactNode;

  align?: TableAlign;

  cell?: (value: TableValue, row: Record<Key, TableValue>) => React.ReactNode;
}

export type TableRowFor<Columns extends readonly TableColumn[]> = Record<
  Columns[number]["key"],
  TableValue
>;

type ExactRow<Row, Shape> = Row extends Shape
  ? Exclude<keyof Row, keyof Shape> extends never
    ? Row
    : Shape & Record<Exclude<keyof Row, keyof Shape>, never>
  : Shape;

export interface TableProps<K extends string, Rows extends readonly object[]> extends Omit<
  React.TableHTMLAttributes<HTMLTableElement>,
  "children"
> {
  columns: readonly TableColumn<K>[];

  rows: readonly [...{ [I in keyof Rows]: ExactRow<Rows[I], NoInfer<Record<K, TableValue>>> }];

  caption?: React.ReactNode;

  getRowKey?: (row: Record<K, TableValue>, index: number) => React.Key;
  ref?: React.Ref<HTMLTableElement>;
}

type TableRuntimeProps = Omit<TableProps<string, readonly Record<string, TableValue>[]>, "rows"> & {
  rows: ReadonlyArray<Record<string, TableValue>>;
};

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
