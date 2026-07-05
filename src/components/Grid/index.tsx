"use client";
import * as React from "react";
import { atoms, type Atoms } from "../../styles/sprinkles.css";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";

/** `align-items`, in friendly terms. */
export type GridAlign = "start" | "center" | "end" | "stretch" | "baseline";
/** `justify-content`, in friendly terms. */
export type GridJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
/**
 * A track template. A number is expanded to that many equal columns/rows
 * (`repeat(n, minmax(0, 1fr))` — `minmax(0, …)` rather than `1fr` so long
 * children can't blow the track out past the container). A string is passed
 * through verbatim, so any valid `grid-template-*` value works
 * (`"200px 1fr"`, `"repeat(auto-fill, minmax(8rem, 1fr))"`, …).
 */
export type GridTracks = number | string;
/**
 * The named-areas map. Accepts whichever form is least error-prone for you:
 *   - an array of cells per row — `[["header", "header"], ["nav", "main"]]`
 *   - an array of rows — `["header header", "nav main"]`
 *   - a single (usually multi-line) string — `` `header header\n nav main` ``
 * Either way you write the cell names and Grid handles the fiddly per-row
 * quoting (and, for the cell-array form, the inter-cell spacing) that
 * `grid-template-areas` actually requires. Rows you've already quoted are left
 * alone, and blank lines are ignored so you can indent freely.
 */
export type GridAreas = string | readonly string[] | readonly (readonly string[])[];

const ALIGN: Record<GridAlign, NonNullable<Atoms["alignItems"]>> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

const JUSTIFY: Record<GridJustify, NonNullable<Atoms["justifyContent"]>> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

/** `number → repeat(n, …)`, string → as-is. */
function toTrackList(value: GridTracks): string {
  return typeof value === "number" ? `repeat(${value}, minmax(0, 1fr))` : value;
}

/**
 * Turn the friendly `areas` prop into a valid `grid-template-areas` value.
 * Normalizes to one string per row — a top-level string is split on newlines,
 * and a row that is itself an array of cells is joined with spaces — then trims
 * each row, drops blank rows, and wraps every row in quotes (unless it already
 * is). So all of
 *   `[["header", "header"], ["nav", "main"]]`
 *   `["header header", "nav main"]`
 *   `` `header header\n nav main` ``
 * become `'"header header" "nav main"'`.
 */
export function toGridTemplateAreas(areas: GridAreas): string {
  const rows = Array.isArray(areas) ? areas : (areas as string).split("\n");
  return rows
    .map((row) => (Array.isArray(row) ? row.join(" ") : (row as string)).trim())
    .filter((row) => row.length > 0)
    .map((row) => (row.startsWith('"') && row.endsWith('"') ? row : `"${row}"`))
    .join(" ");
}

export interface GridProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  /** `grid-template-columns`. A number becomes that many equal columns. */
  columns?: GridTracks;
  /** `grid-template-rows`. A number becomes that many equal rows. */
  rows?: GridTracks;
  /**
   * `grid-template-areas`, minus the footguns. Pass an array of rows or a
   * multi-line string of cell names — Grid adds the required per-row quotes.
   */
  areas?: GridAreas;

  /** `align-items`. Omit to leave it at the grid default (`stretch`). */
  align?: GridAlign;
  /** `justify-content`. Omit to leave it at the grid default (`start`). */
  justify?: GridJustify;
  /** Gap between tracks, from the spacing scale (responsive-capable). */
  gap?: Atoms["gap"];
  /** Render as `inline-grid` rather than block `grid`. */
  inline?: boolean;

  /** Margin (all sides), from the spacing scale (or `auto`). */
  m?: Atoms["m"];
  /** Inline margin (left + right). */
  mx?: Atoms["mx"];
  /** Block margin (top + bottom). */
  my?: Atoms["my"];
  mt?: Atoms["mt"];
  mr?: Atoms["mr"];
  mb?: Atoms["mb"];
  ml?: Atoms["ml"];

  /** Padding (all sides), from the spacing scale. */
  p?: Atoms["p"];
  /** Inline padding (left + right). */
  px?: Atoms["px"];
  /** Block padding (top + bottom). */
  py?: Atoms["py"];
  pt?: Atoms["pt"];
  pr?: Atoms["pr"];
  pb?: Atoms["pb"];
  pl?: Atoms["pl"];

  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

/**
 * Grid — a CSS-grid container primitive, the grid counterpart to `Flex`, so
 * common two-dimensional layouts don't have to reach for `atoms` directly.
 * Renders a `<div>` with `display: grid` (or `inline-grid`); `columns` / `rows`
 * accept a track count or any `grid-template-*` string, and `areas` takes the
 * friendly array/multi-line form and handles the per-row quoting that
 * `grid-template-areas` normally makes so easy to get wrong. `align` / `justify`
 * take friendly values mapped to the grid keywords, and the `gap`, margin
 * (`m` / `mx` / …) and padding (`p` / `px` / …) props are wired straight to the
 * spacing scale (each responsive-capable). Use `render` to change the element.
 */
export function Grid({
  columns,
  rows,
  areas,
  align,
  justify,
  gap,
  inline,
  m,
  mx,
  my,
  mt,
  mr,
  mb,
  ml,
  p,
  px,
  py,
  pt,
  pr,
  pb,
  pl,
  render,
  className,
  style,
  children,
  ref,
  ...rest
}: GridProps) {
  const gridStyle: React.CSSProperties = {};
  if (columns != null) gridStyle.gridTemplateColumns = toTrackList(columns);
  if (rows != null) gridStyle.gridTemplateRows = toTrackList(rows);
  if (areas != null) gridStyle.gridTemplateAreas = toGridTemplateAreas(areas);

  return useRender({
    render,
    defaultElement: "div",
    props: {
      ref,
      className: cx(
        atoms({
          display: inline ? "inline-grid" : "grid",
          alignItems: align ? ALIGN[align] : undefined,
          justifyContent: justify ? JUSTIFY[justify] : undefined,
          gap,
          m,
          mx,
          my,
          mt,
          mr,
          mb,
          ml,
          p,
          px,
          py,
          pt,
          pr,
          pb,
          pl,
        }),
        className,
      ),
      // Consumer `style` wins over the computed grid template.
      style: { ...gridStyle, ...style },
      children,
      ...rest,
    },
  });
}

Grid.displayName = "Grid";
