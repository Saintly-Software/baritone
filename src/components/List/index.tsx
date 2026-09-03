"use client";
import * as React from "react";
import type { Atoms } from "../../styles/sprinkles.css";
import { cx } from "../../utils/cx";
import { keyedElements } from "../../utils/keyedElements";
import { useRender, type RenderProp } from "../../utils/render";
import { Flex, type FlexAlign, type FlexDirection, type FlexJustify } from "../Flex";
import { Grid, type GridAreas, type GridJustify, type GridTracks } from "../Grid";
import { listItem, listReset } from "./list.css";

/**
 * How the list arranges its items:
 *   - `flex` (default) — a one-dimensional stack/row, tuned via `direction`,
 *     `align`, `justify`, `wrap`, `gap` (the `Flex` knobs).
 *   - `grid` — a two-dimensional layout, tuned via `columns`, `rows`, `areas`,
 *     `justify`, `gap` (the `Grid` knobs).
 * Discriminant of {@link ListProps}: layout-specific props only type-check for
 * the matching `layout`.
 */
export type ListLayout = "flex" | "grid";

export interface ListItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "color"> {
  /**
   * Places this item in a named grid area. Meaningful only with the parent
   * `List`'s `layout="grid"` + `areas`; a consumer `style.gridArea` wins.
   */
  area?: string;
  /** Render as a different element/component (base-ui `render` pattern). Defaults to `<li>`. */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

/**
 * List.Item — one list cell, passed per entry in the `List`'s `items` array. A
 * semantic `<li>` (explicit `role="listitem"`; Safari drops the implicit role
 * under `list-style: none`) wrapping arbitrary content. `area` places it in a
 * named grid region; `render` changes the element.
 */
function ListItem({ area, render, className, style, children, ref, ...rest }: ListItemProps) {
  return useRender({
    render,
    defaultElement: "li",
    props: {
      ref,
      // Explicit role — see doc above (Safari drops the implicit one).
      role: "listitem",
      className: cx(listItem, className),
      style: area != null ? { gridArea: area, ...style } : style,
      children,
      ...rest,
    },
  });
}

ListItem.displayName = "List.Item";

/** Props shared by both layouts. */
interface ListBaseProps extends Omit<React.HTMLAttributes<HTMLElement>, "color" | "children"> {
  /**
   * Renders an ordered list (`<ol>`) rather than `<ul>`, communicating sequence to
   * assistive tech. The visual marker is stripped either way; `ordered` only
   * changes the semantic element. Default `false`.
   */
  ordered?: boolean;
  /**
   * The rows to render, each a `<List.Item>`. Keyed by each entry's `key` (falls
   * back to index — supply `key` for stable identity). Falsy entries are skipped,
   * so a row can be included conditionally (`cond && <List.Item …/>`).
   */
  items: Array<React.ReactElement<ListItemProps> | null | false | undefined>;
  ref?: React.Ref<HTMLElement>;
}

/** `List` with `layout="flex"` (the default) — exposes the `Flex` layout knobs. */
export interface ListFlexProps extends ListBaseProps {
  layout?: "flex";
  /** Gap between items, from the spacing scale (responsive-capable). */
  gap?: Atoms["gap"];
  /** Flow direction — `row` or `column`. */
  direction?: FlexDirection;
  /** Cross-axis `align-items`, in friendly terms (`start` / `center` / …). */
  align?: FlexAlign;
  /** Main-axis `justify-content`, in friendly terms (`start` / `between` / …). */
  justify?: FlexJustify;
  /** Allow items to wrap onto multiple lines. */
  wrap?: boolean;
}

/** `List` with `layout="grid"` — exposes the `Grid` layout knobs. */
export interface ListGridProps extends ListBaseProps {
  layout: "grid";
  /** Gap between tracks, from the spacing scale (responsive-capable). */
  gap?: Atoms["gap"];
  /** `grid-template-columns`. A number becomes that many equal columns. */
  columns?: GridTracks;
  /** `grid-template-rows`. A number becomes that many equal rows. */
  rows?: GridTracks;
  /**
   * `grid-template-areas`, minus the footguns. Pass an array of rows or a
   * multi-line string of cell names; place items with `List.Item`'s `area`.
   */
  areas?: GridAreas;
  /** Main-axis `justify-content`, in friendly terms (`start` / `between` / …). */
  justify?: GridJustify;
}

/**
 * List props — a discriminated union on `layout`. With `layout="flex"` (the
 * default) the `Flex` knobs (`direction` / `align` / `gap`) are available; with
 * `layout="grid"` the `Grid` knobs (`columns` / `areas` / `gap`) are.
 */
export type ListProps = ListFlexProps | ListGridProps;

/**
 * List — a semantic list (`<ul>`, or `<ol>` when `ordered`) laid out with either
 * flexbox or CSS grid. `layout="flex"` (default) delegates to `Flex` (`direction`
 * / `align` / `justify` / `wrap` / `gap`); `layout="grid"` delegates to `Grid`
 * (`columns` / `rows` / `areas` / `justify` / `gap`, placing items via
 * `List.Item`'s `area`). Only the active layout's knobs type-check.
 *
 * Provide the rows as the `items` array, each a `<List.Item>`. Default
 * `<ul>`/`<ol>` margin/padding/marker are reset so the layout drives spacing; the
 * list keeps a real `role="list"` (Safari strips it under `list-style: none`).
 *
 * @example
 * // Flex: a spaced vertical stack.
 * <List
 *   direction="column"
 *   gap="2"
 *   items={[<List.Item key="1">First</List.Item>, <List.Item key="2">Second</List.Item>]}
 * />
 *
 * @example
 * // Grid: three equal columns from a data array.
 * <List
 *   layout="grid"
 *   columns={3}
 *   gap="4"
 *   items={rows.map((r) => <List.Item key={r.id}>{r.label}</List.Item>)}
 * />
 */
/**
 * Every layout prop widened into one shape, so a single destructure strips *all*
 * of them from `...rest` regardless of the active layout — otherwise an inactive
 * layout's prop would leak into `rest`, reaching the DOM as an invalid attribute
 * or (for `align`, accepted by both) silently changing the layout. Guards JS
 * callers the `ListProps` union can't reach (e.g. Storybook retaining controls
 * across a `layout` switch).
 */
type ResolvedListProps = ListBaseProps & {
  layout?: ListLayout;
  gap?: Atoms["gap"];
  // `FlexJustify` and `GridJustify` are the same union; one field covers both.
  justify?: FlexJustify;
  direction?: FlexDirection;
  align?: FlexAlign;
  wrap?: boolean;
  columns?: GridTracks;
  rows?: GridTracks;
  areas?: GridAreas;
};

function ListRoot(props: ListProps) {
  const {
    layout,
    ordered = false,
    items,
    gap,
    justify,
    direction,
    align,
    wrap,
    columns,
    rows,
    areas,
    className,
    ref,
    ...rest
  } = props as ResolvedListProps;

  const element = ordered ? <ol /> : <ul />;
  const listClassName = cx(listReset, className);
  // Same `items` rule as `Menu`: `List` renders the `<List.Item>` element itself,
  // rather than reading its props the way `ButtonGroup` / `ChipList` do.
  const content = keyedElements(items);

  if (layout === "grid") {
    return (
      <Grid
        render={element}
        role="list"
        ref={ref}
        gap={gap}
        columns={columns}
        rows={rows}
        areas={areas}
        justify={justify}
        className={listClassName}
        {...rest}
      >
        {content}
      </Grid>
    );
  }

  return (
    <Flex
      render={element}
      role="list"
      ref={ref}
      gap={gap}
      direction={direction}
      align={align}
      justify={justify}
      wrap={wrap}
      className={listClassName}
      {...rest}
    >
      {content}
    </Flex>
  );
}

ListRoot.displayName = "List";

/** List with its `Item` part attached. */
export const List = Object.assign(ListRoot, {
  Item: ListItem,
});
