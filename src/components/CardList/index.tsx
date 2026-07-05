"use client";
import * as React from "react";
import type { SpaceKey } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { cardListItem, cardListRoot } from "./cardList.css";

/**
 * A CardList must be named, so screen-reader users hear what the list is. Supply
 * exactly one of `aria-label` (a literal string) or `aria-labelledby` (the id of a
 * visible heading) — the union makes providing neither a type error.
 */
type CardListLabel =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-labelledby": string; "aria-label"?: never };

export interface CardListBaseProps extends Omit<
  React.HTMLAttributes<HTMLUListElement>,
  "aria-label" | "aria-labelledby" | "children"
> {
  /** Gap between cards, from the spacing scale. Default `4`. */
  gap?: SpaceKey;
  /** The cards — each is wrapped in its own `<li>`. */
  children: React.ReactNode;
  ref?: React.Ref<HTMLUListElement>;
}

/**
 * CardList props — the base props plus the required accessible name (`aria-label`
 * **or** `aria-labelledby`).
 */
export type CardListProps = CardListBaseProps & CardListLabel;

/**
 * CardList — renders a set of `Card`s as a semantic vertical list. Each child card
 * is wrapped in its own `<li>`, and the list is a real `<ul>` (`role="list"`) so
 * it's announced as a list with one item per card. Cards are spaced by `gap`
 * (default `4`). A name is required: pass `aria-label` or `aria-labelledby`.
 *
 * @example
 * <CardList aria-label="Team members" gap="3">
 *   <Card header="Ada Lovelace" description="Engineering" />
 *   <Card header="Alan Turing" description="Research" />
 * </CardList>
 */
export function CardList({ gap, className, children, ref, ...rest }: CardListProps) {
  return (
    // `role="list"` is set explicitly: with `list-style: none` Safari otherwise
    // strips the implicit list role from a `<ul>`.
    <ul ref={ref} role="list" className={cx(cardListRoot({ gap }), className)} {...rest}>
      {React.Children.map(children, (child, index) => (
        // `list-style: none` can drop the implicit listitem role in Safari, so the
        // role is set explicitly to keep the list semantics.
        <li
          key={React.isValidElement(child) && child.key != null ? child.key : index}
          role="listitem"
          className={cardListItem}
        >
          {child}
        </li>
      ))}
    </ul>
  );
}

CardList.displayName = "CardList";
