"use client";
import * as React from "react";
import type { SpaceKey } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { cardListItem, cardListRoot } from "./cardList.css";

type CardListLabel =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-labelledby": string; "aria-label"?: never };

export interface CardListBaseProps extends Omit<
  React.HTMLAttributes<HTMLUListElement>,
  "aria-label" | "aria-labelledby" | "children"
> {
  gap?: SpaceKey;

  children: React.ReactNode;
  ref?: React.Ref<HTMLUListElement>;
}

export type CardListProps = CardListBaseProps & CardListLabel;

export function CardList({ gap, className, children, ref, ...rest }: CardListProps) {
  return (
    <ul ref={ref} role="list" className={cx(cardListRoot({ gap }), className)} {...rest}>
      {React.Children.map(children, (child, index) => (
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
