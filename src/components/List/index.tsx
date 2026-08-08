"use client";
import * as React from "react";
import type { Atoms } from "../../styles/sprinkles.css";
import { cx } from "../../utils/cx";
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
 * List.Item — one list cell. Rendered automatically for each entry when you pass
 * the `items` array, or dropped in as `children` for element-composed lists
 * (`<List><List.Item>…</List.Item></List>`). It's a semantic `<li>` (with an
 * explicit `role="listitem"`, since `list-style: none` drops the implicit role
 * in Safari) that wraps arbitrary content. For grid layouts, `area` places the
 * item in a named `grid-template-areas` region. Use `render` to change the
 * element.
 */
function ListItem({ area, render, className, style, children, ref, ...rest }: ListItemProps) {
  return useRender({
    render,
    defaultElement: "li",
    props: {
      ref,
      // `list-style: none` can drop the implicit listitem role in Safari, so the
      // role is set explicitly to keep the list semantics.
      role: "listitem",
      className: cx(listItem, className),
      // Consumer `style` wins over the computed grid-area placement.
      style: area != null ? { gridArea: area, ...style } : style,
      children,
      ...rest,
    },
  });
}

ListItem.displayName = "List.Item";

/** Props shared by both layouts. */
interface ListBaseProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  /**
   * Render an ordered list (`<ol>`) rather than an unordered one (`<ul>`),
   * communicating sequence to assistive tech. The visual marker is stripped
   * either way (it doesn't flow through flex/grid tracks) — `ordered` only
   * changes the semantic element. Default `false`.
   */
  ordered?: boolean;
  /**
   * The items to render, each a `List.Item`'s props. Keyed by each entry's `id`
   * (falling back to its index — supply `id` for a stable key). Omit and pass
   * `List.Item` `children` instead for element-composed lists; when `items` is
   * provided it wins.
   */
  items?: ListItemProps[];
  /**
   * Element-composed form: `List.Item` elements (or any content). Ignored when
   * `items` is provided (the data array wins).
   */
  children?: React.ReactNode;
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

function renderItems(
  items: ListItemProps[] | undefined,
  children: React.ReactNode,
): React.ReactNode {
  // The data array wins when provided; otherwise render composed children.
  if (items == null) return children;
  return items.map((item, index) => <ListItem key={item.id ?? index} {...item} />);
}

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
 * Provide items as the `items` array (each entry a `List.Item`'s props) or
 * compose them as `List.Item` `children`. The default `<ul>`/`<ol>` margin,
 * padding, and marker are reset so the layout drives all spacing; the list keeps
 * a real `role="list"` (Safari strips it under `list-style: none`).
 *
 * @example
 * // Flex: a spaced vertical stack.
 * <List direction="column" gap="2">
 *   <List.Item>First</List.Item>
 *   <List.Item>Second</List.Item>
 * </List>
 *
 * @example
 * // Grid: three equal columns from a data array.
 * <List layout="grid" columns={3} gap="4" items={rows.map((r) => ({ id: r.id, children: r.label }))} />
 */
function ListRoot(props: ListProps) {
  if (props.layout === "grid") {
    const {
      layout: _layout,
      ordered = false,
      items,
      gap,
      columns,
      rows,
      areas,
      justify,
      className,
      children,
      ref,
      ...rest
    } = props;
    return (
      <Grid
        render={ordered ? <ol /> : <ul />}
        role="list"
        ref={ref}
        gap={gap}
        columns={columns}
        rows={rows}
        areas={areas}
        justify={justify}
        className={cx(listReset, className)}
        {...rest}
      >
        {renderItems(items, children)}
      </Grid>
    );
  }

  const {
    layout: _layout,
    ordered = false,
    items,
    gap,
    direction,
    align,
    justify,
    wrap,
    className,
    children,
    ref,
    ...rest
  } = props;
  return (
    <Flex
      render={ordered ? <ol /> : <ul />}
      role="list"
      ref={ref}
      gap={gap}
      direction={direction}
      align={align}
      justify={justify}
      wrap={wrap}
      className={cx(listReset, className)}
      {...rest}
    >
      {renderItems(items, children)}
    </Flex>
  );
}

ListRoot.displayName = "List";

/** List with its `Item` part attached. */
export const List = Object.assign(ListRoot, {
  Item: ListItem,
});
