"use client";
import * as React from "react";
import type { Atoms } from "../../styles/sprinkles.css";
import { cx } from "../../utils/cx";
import { keyedElements } from "../../utils/keyedElements";
import { useRender, type RenderProp } from "../../utils/render";
import { Flex, type FlexAlign, type FlexDirection, type FlexJustify } from "../Flex";
import { Grid, type GridAreas, type GridJustify, type GridTracks } from "../Grid";
import { listItem, listReset } from "./list.css";

export type ListLayout = "flex" | "grid";

export interface ListItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "color"> {
  area?: string;

  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

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

interface ListBaseProps extends Omit<React.HTMLAttributes<HTMLElement>, "color" | "children"> {
  ordered?: boolean;

  items: Array<React.ReactElement<ListItemProps> | null | false | undefined>;
  ref?: React.Ref<HTMLElement>;
}

export interface ListFlexProps extends ListBaseProps {
  layout?: "flex";

  gap?: Atoms["gap"];

  direction?: FlexDirection;

  align?: FlexAlign;

  justify?: FlexJustify;

  wrap?: boolean;
}

export interface ListGridProps extends ListBaseProps {
  layout: "grid";

  gap?: Atoms["gap"];

  columns?: GridTracks;

  rows?: GridTracks;

  areas?: GridAreas;

  justify?: GridJustify;
}

export type ListProps = ListFlexProps | ListGridProps;

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

export const List = Object.assign(ListRoot, {
  Item: ListItem,
});
