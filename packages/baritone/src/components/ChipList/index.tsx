"use client";
import * as React from "react";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { keyedElements } from "../../utils/keyedElements";
import { Chip, type ChipProps } from "../Chip";
import { Popover } from "../Popover";
import { chipListItem, chipListRoot } from "./chipList.css";

export type ChipListItemProps = Omit<ChipProps, "size">;

export function ChipListItem(_props: ChipListItemProps): React.ReactNode {
  return null;
}
ChipListItem.displayName = "ChipList.Item";

export type ChipListOrientation = "horizontal" | "vertical";

export interface ChipListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "children"> {
  items: Array<React.ReactElement<ChipListItemProps> | null | false | undefined>;

  intent?: Intent;

  saliency?: Saliency;

  size?: Size;

  orientation?: ChipListOrientation;

  max?: number;

  seeMoreLabel?: string | ((remaining: number) => string);
  ref?: React.Ref<HTMLUListElement>;
}

function ChipListRow({
  item,
  intent,
  saliency,
  size,
}: {
  item: React.ReactElement<ChipListItemProps>;
  intent?: Intent;
  saliency?: Saliency;
  size?: Size;
}) {
  const { intent: itemIntent, saliency: itemSaliency, ...chipProps } = item.props;
  return (
    <li role="listitem" className={chipListItem}>
      <Chip
        {...chipProps}
        intent={itemIntent ?? intent}
        saliency={itemSaliency ?? saliency}
        size={size}
      />
    </li>
  );
}

export function ChipList({
  items,
  intent,
  saliency,
  size,
  orientation = "horizontal",
  max,
  seeMoreLabel = "See more",
  className,
  ref,
  ...rest
}: ChipListProps) {
  const resolved = keyedElements(items);
  const overflows = max != null && resolved.length > max;
  const visible = overflows ? resolved.slice(0, max) : resolved;
  const remaining = overflows ? resolved.slice(max) : [];

  const seeMoreText =
    typeof seeMoreLabel === "function" ? seeMoreLabel(remaining.length) : seeMoreLabel;

  return (
    <ul
      ref={ref}
      role="list"
      className={cx(chipListRoot({ orientation, size }), className)}
      {...rest}
    >
      {visible.map((item) => (
        <ChipListRow key={item.key} item={item} intent={intent} saliency={saliency} size={size} />
      ))}

      {overflows && (
        <li role="listitem" className={chipListItem}>
          <Chip
            intent={intent}
            saliency={saliency}
            size={size}
            popover={
              <Popover>
                <ChipList
                  items={remaining}
                  intent={intent}
                  saliency={saliency}
                  size={size}
                  orientation="vertical"
                />
              </Popover>
            }
          >
            {seeMoreText}
          </Chip>
        </li>
      )}
    </ul>
  );
}

ChipList.displayName = "ChipList";
ChipList.Item = ChipListItem;
