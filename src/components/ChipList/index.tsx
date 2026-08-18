"use client";
import * as React from "react";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { Chip, type ChipProps } from "../Chip";
import { Popover } from "../Popover";
import { chipListItem, chipListRoot } from "./chipList.css";

/**
 * One entry in a `ChipList` — the props for a single `Chip`, minus `size`
 * (the list owns sizing for every chip, so it can't be set per item). Supply a
 * stable `key` on the element when the list can reorder, otherwise the array
 * index is used.
 *
 * `intent` and `saliency` are still allowed here: they override the list-level
 * defaults for just this chip.
 */
export type ChipListItemProps = Omit<ChipProps, "size">;

/**
 * `ChipList.Item` — a **configuration element**, not a rendered one. It only
 * carries props: `ChipList` reads them off the elements you pass in `items` and
 * renders each as a `<Chip>` in its own `<li>` itself (so it can apply the
 * list's shared sizing/intent and collapse the overflow behind a "See more"
 * chip). Rendering an `Item` on its own emits nothing; it's meaningful only
 * inside a `ChipList`'s `items`.
 */
export function ChipListItem(_props: ChipListItemProps): React.ReactNode {
  return null;
}
ChipListItem.displayName = "ChipList.Item";

/** Layout direction of the chip list. */
export type ChipListOrientation = "horizontal" | "vertical";

export interface ChipListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "children"> {
  /** The chips to render, each a `<ChipList.Item>` element. Keyed by `key`. */
  items: React.ReactElement<ChipListItemProps>[];
  /**
   * Default colour intent for every chip. A chip can override it via its own
   * item-level `intent`. Defaults to the `Chip` default (`neutral`).
   */
  intent?: Intent;
  /**
   * Default saliency for every chip. A chip can override it via its own
   * item-level `saliency`. Defaults to the `Chip` default (`mid`).
   */
  saliency?: Saliency;
  /**
   * Size applied to every chip — it cannot be overridden per item. Also tunes
   * the spacing between chips (a list of `sm` chips packs tighter than `lg`).
   * Defaults to the `Chip` default (`md`).
   */
  size?: Size;
  /** Flow the chips in a wrapping row (default) or stack them in a column. */
  orientation?: ChipListOrientation;
  /**
   * Cap how many of the supplied chips are shown inline. When there are more
   * items than `max`, only the first `max` render and a trailing "See more" chip
   * is appended whose `Popover` lists the remainder. Omit to show every chip.
   */
  max?: number;
  /**
   * Label for the overflow "See more" chip shown once `items` exceeds `max`.
   * Pass a string, or a function of the hidden count for things like
   * `(n) => `+${n}``. Defaults to `"See more"`.
   */
  seeMoreLabel?: string | ((remaining: number) => string);
  ref?: React.Ref<HTMLUListElement>;
}

/**
 * Render a single item as a `<Chip>` inside its `<li>`. Item-level `intent` /
 * `saliency` win over the list-level defaults; `size` always comes from the list
 * (the item type omits it, and it's applied after the spread so it can't be
 * overridden even at runtime).
 */
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
    // `list-style: none` can drop the implicit listitem role in Safari, so the
    // role is set explicitly to keep the list semantics the request calls for.
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

/**
 * ChipList — renders a set of chips as a semantic list, flowed in a wrapping row
 * (default) or stacked in a column. Each chip is supplied as a `<ChipList.Item>`
 * (a `Chip`'s props); the list applies shared `intent` / `saliency` (each
 * overridable per item) and `size` (applied to every chip and not overridable,
 * which also sets the spacing between chips).
 *
 * Pass `max` to cap how many chips show inline: any beyond it collapse behind a
 * trailing "See more" chip whose `Popover` lists the rest.
 *
 * The list is a real `<ul>` (`role="list"`) of `<li>`s (`role="listitem"`), so
 * it's announced as a list with one item per chip.
 *
 * @example
 * <ChipList
 *   intent="primary"
 *   saliency="mid"
 *   max={3}
 *   items={[
 *     <ChipList.Item key="react">React</ChipList.Item>,
 *     <ChipList.Item key="critical" intent="negative" saliency="high">Critical</ChipList.Item>,
 *     <ChipList.Item key="ts">TypeScript</ChipList.Item>,
 *     <ChipList.Item key="vite">Vite</ChipList.Item>,
 *   ]}
 * />
 */
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
  const overflows = max != null && items.length > max;
  const visible = overflows ? items.slice(0, max) : items;
  const remaining = overflows ? items.slice(max) : [];

  const seeMoreText =
    typeof seeMoreLabel === "function" ? seeMoreLabel(remaining.length) : seeMoreLabel;

  return (
    // `role="list"` is set explicitly: with `list-style: none` Safari otherwise
    // strips the implicit list role from a `<ul>`.
    <ul
      ref={ref}
      role="list"
      className={cx(chipListRoot({ orientation, size }), className)}
      {...rest}
    >
      {visible.map((item, index) => (
        <ChipListRow
          key={item.key ?? index}
          item={item}
          intent={intent}
          saliency={saliency}
          size={size}
        />
      ))}

      {/* The overflow chip: a popover trigger whose surface holds the hidden
          chips as their own (vertical) ChipList, inheriting the same defaults. */}
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
