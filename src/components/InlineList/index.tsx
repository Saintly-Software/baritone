"use client";
import * as React from "react";
import type { Atoms } from "../../styles/sprinkles.css";
import type { MarginProps } from "../../styles/spacingProps";
import type { RenderProp } from "../../utils/render";
import { Flex, type FlexAlign } from "../Flex";

export interface InlineListProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">, MarginProps {
  /**
   * The delimiter drawn between items: a string (the default `·`) or any node.
   * A falsy value (`null` / `false` / `""`) separates items with the `gap`
   * alone. It's rendered `aria-hidden` and `inert` (so also non-selectable), so
   * the row reads — and copies — as just its items, and an interactive delimiter
   * node can't take focus or clicks.
   */
  separator?: React.ReactNode;
  /** Gap between items (and each separator), from the spacing scale. Default `2`. */
  gap?: Atoms["gap"];
  /** Cross-axis alignment of the items. Default `center` (dots line up with text). */
  align?: FlexAlign;
  /** Wrap onto multiple lines when the row runs out of room. Default `true`. */
  wrap?: boolean;
  /** Render as a different element/component (base-ui `render` pattern). Default `div`. */
  render?: RenderProp;
  ref?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}

/**
 * A horizontal run of items separated by a delimiter, wrapping when it runs out of
 * room — the classic metadata line (`12 lines · 340 words · Updated 2h ago`).
 * Interleaves the `separator`, spaces with `gap`, and wraps. Falsy children are
 * dropped (so a conditional item leaves no dangling separator), and separators are
 * `aria-hidden` / `inert` / non-selectable. Not a semantic list — for that, use
 * `List`. Typography is inherited, not imposed.
 *
 * @example
 * <InlineList>
 *   <Text>12 lines</Text>
 *   <Text>340 words</Text>
 *   {isLyrics && <Text>Words by {author}</Text>}
 * </InlineList>
 */
export function InlineList({
  separator = "·",
  gap = "2",
  align = "center",
  wrap = true,
  render,
  className,
  children,
  ref,
  ...rest
}: InlineListProps) {
  const items = React.Children.toArray(children).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <Flex
      ref={ref}
      render={render}
      align={align}
      gap={gap}
      wrap={wrap}
      className={className}
      {...rest}
    >
      {items.map((child, index) => {
        const key = React.isValidElement(child) && child.key != null ? child.key : index;
        return (
          <React.Fragment key={key}>
            {index > 0 && separator ? (
              <span aria-hidden="true" inert>
                {separator}
              </span>
            ) : null}
            {child}
          </React.Fragment>
        );
      })}
    </Flex>
  );
}

InlineList.displayName = "InlineList";
