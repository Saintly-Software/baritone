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
 *   - `flex` (default) — a one-dimensional stack/row, tuned with `direction`,
 *     `align`, `justify`, `wrap`, and `gap` (the `Flex` layout knobs).
 *   - `grid` — a two-dimensional layout, tuned with `columns`, `rows`, `areas`,
 *     `justify`, and `gap` (the `Grid` layout knobs).
 * The prop is the discriminant of {@link ListProps}: the layout-specific props
 * only type-check for the matching `layout`.
 */
export type ListLayout = "flex" | "grid";

export interface ListItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "color"> {
  /**
   * Place this item in a named grid area — sets `grid-area`. Only meaningful when
   * the parent `List` uses `layout="grid"` with `areas`; ignored otherwise. A
   * consumer `style.gridArea` wins.
   */
  area?: string;
  /** Render as a different element/component (base-ui `render` pattern). Defaults to `<li>`. */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

/**
 * List.Item — one list cell. Pass a `<List.Item>` per entry in the `List`'s
 * `items` array. It's a semantic `<li>` (with an explicit `role="listitem"`,
 * since `list-style: none` drops the implicit role in Safari) that wraps
 * arbitrary content. For grid layouts, `area` places the item in a named
 * `grid-template-areas` region. Use `render` to change the element.
 */
function ListItem({ area, render, className, style, children, ref, ...rest }: ListItemProps) {
  return useRender({
    render,
    defaultElement: "li",
    props: {
      ref,
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
   * Render an ordered list (`<ol>`) rather than an unordered one (`<ul>`),
   * communicating sequence to assistive tech. The visual marker is stripped
   * either way (it doesn't flow through flex/grid tracks) — `ordered` only
   * changes the semantic element. Default `false`.
   */
  ordered?: boolean;
  /**
   * The rows to render, each a `<List.Item>` element. Keyed by each entry's
   * `key` (falling back to its index — supply `key` for a stable identity).
   * Falsy entries (`null` / `false` / `undefined`) are skipped, so a row can be
   * included conditionally inline (`cond && <List.Item …/>`).
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
 * List — a semantic list (`<ul>`, or `<ol>` when `ordered`) whose items are laid
 * out with either flexbox or CSS grid. `layout="flex"` (default) delegates to
 * `Flex`, so `direction` / `align` / `justify` / `wrap` / `gap` behave exactly
 * as they do there; `layout="grid"` delegates to `Grid`, exposing `columns` /
 * `rows` / `areas` / `justify` / `gap` (place items in named areas with
 * `List.Item`'s `area`). The prop set is a
 * discriminated union on `layout`, so only the knobs for the active layout
 * type-check.
 *
 * Provide the rows as the `items` array, each a `<List.Item>` element. The
 * default `<ul>`/`<ol>` margin, padding, and marker are reset so the layout
 * drives all spacing; the list keeps a real `role="list"` (Safari strips it
 * under `list-style: none`).
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
 * Every layout prop widened into one shape, so a single destructure can strip
 * *all* of them from `...rest` regardless of the active layout. Without this the
 * inactive layout's props (e.g. `direction` when `layout="grid"`) would fall
 * into `rest` and reach `Flex` / `Grid` — and from there the native list element
 * as invalid attributes, or (for `align`, which both accept) silently change the
 * layout. The `ListProps` union can't be passed at runtime the way the types
 * imply (Storybook retains controls across a `layout` switch), so this guards the
 * JS callers the discriminated union can't reach.
 */
type ResolvedListProps = ListBaseProps & {
  layout?: ListLayout;
  gap?: Atoms["gap"];
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
