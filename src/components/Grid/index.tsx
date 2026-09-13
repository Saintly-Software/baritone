"use client";
import * as React from "react";
import { atoms, type Atoms } from "../../styles/sprinkles.css";
import type { MarginProps, PaddingProps } from "../../styles/spacingProps";
import { cx } from "../../utils/cx";
import { useRender, type RenderProp } from "../../utils/render";

export type GridAlign = "start" | "center" | "end" | "stretch" | "baseline";

export type GridJustify = "start" | "center" | "end" | "between" | "around" | "evenly";

export type GridTracks = number | string;

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

function toTrackList(value: GridTracks): string {
  return typeof value === "number" ? `repeat(${value}, minmax(0, 1fr))` : value;
}

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
  columns?: GridTracks;

  rows?: GridTracks;

  areas?: GridAreas;

  align?: GridAlign;

  justify?: GridJustify;

  gap?: Atoms["gap"];

  inline?: boolean;

  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

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
