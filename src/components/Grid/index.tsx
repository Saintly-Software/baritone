"use client";
import * as React from "react";
import { atoms, type Atoms } from "../../styles/sprinkles.css";
import type { MarginProps, PaddingProps } from "../../styles/spacingProps";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";

/** `align-items`, in friendly terms. */
export type GridAlign = "start" | "center" | "end" | "stretch" | "baseline";
/** `justify-content`, in friendly terms. */
export type GridJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
/**
 * A track template. A number expands to that many equal columns/rows
 * (`repeat(n, minmax(0, 1fr))`, so long children can't blow the track out); a
 * string passes through verbatim, so any `grid-template-*` value works.
 */
export type GridTracks = number | string;
/**
 * The named-areas map, in whichever form is least error-prone:
 *   - an array of cells per row — `[["header", "header"], ["nav", "main"]]`
 *   - an array of rows — `["header header", "nav main"]`
 *   - a single multi-line string — `` `header header\n nav main` ``
 * Grid handles the per-row quoting `grid-template-areas` requires.
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
 * Turn the friendly `areas` prop into a valid `grid-template-areas` value — one
 * quoted string per row, blank rows dropped. Every {@link GridAreas} form becomes
 * e.g. `'"header header" "nav main"'`.
 */
export function toGridTemplateAreas(areas: GridAreas): string {
  const rows = Array.isArray(areas) ? areas : (areas as string).split("\n");
  return rows
    .map((row) => (Array.isArray(row) ? row.join(" ") : (row as string)).trim())
    .filter((row) => row.length > 0)
    .map((row) => (row.startsWith('"') && row.endsWith('"') ? row : `"${row}"`))
    .join(" ");
}

export interface GridProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">, MarginProps, PaddingProps {
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

  /** Render as a different element/component (base-ui `render` pattern). */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

/**
 * A CSS-grid container primitive, the grid counterpart to `Flex`. Renders a
 * `<div>` with `display: grid` (or `inline-grid`); `columns` / `rows` take a
 * track count or any `grid-template-*` string, `areas` the friendly array/string
 * form, and `align` / `justify` / `gap` / margin / padding map to the spacing
 * scale. Use `render` to change the element.
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
          minWidth: "0",
          minHeight: "0",
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
      style: { ...gridStyle, ...style },
      children,
      ...rest,
    },
  });
}

Grid.displayName = "Grid";
