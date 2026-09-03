"use client";
import * as React from "react";
import type { Intent, Saliency, Size } from "../../theme/constants";
import { cx } from "../../utils/cx";
import { keyedElements } from "../../utils/keyedElements";
import { Chip, type ChipProps } from "../Chip";
import { Popover } from "../Popover";
import { chipListItem, chipListRoot } from "./chipList.css";

/**
 * One entry in a `ChipList` — the props for a single `Chip`, minus `size` (the
 * list owns sizing for every chip). Supply a stable `key` when the list can
 * reorder, otherwise the array index is used. `intent`/`saliency` are still
 * allowed, overriding the list-level defaults for just this chip.
 */
export type ChipListItemProps = Omit<ChipProps, "size">;

/**
 * `ChipList.Item` — a **configuration element**, not a rendered one. It only
 * carries props: `ChipList` reads them off the `items` it's passed and renders
 * each as a `<Chip>` itself, so it can apply shared sizing/intent and collapse
 * overflow behind a "See more" chip. Rendering an `Item` on its own emits nothing.
 */
export function ChipListItem(_props: ChipListItemProps): React.ReactNode {
  return null;
}
ChipListItem.displayName = "ChipList.Item";

/** Layout direction of the chip list. */
export type ChipListOrientation = "horizontal" | "vertical";

export interface ChipListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "children"> {
  /**
   * The chips to render, each a `<ChipList.Item>` element (keyed by `key`,
   * falling back to index). Falsy entries are skipped for conditional inclusion.
   */
  items: Array<React.ReactElement<ChipListItemProps> | null | false | undefined>;
  /**
   * Default colour intent for every chip, overridable per item. Defaults to the
   * `Chip` default (`neutral`).
   */
  intent?: Intent;
  /**
   * Default saliency for every chip, overridable per item. Defaults to the
   * `Chip` default (`mid`).
   */
  saliency?: Saliency;
  /**
   * Size applied to every chip — cannot be overridden per item. Also tunes the
   * spacing between chips (`sm` packs tighter than `lg`). Defaults to `md`.
   */
  size?: Size;
  /** Flow the chips in a wrapping row (default) or stack them in a column. */
  orientation?: ChipListOrientation;
  /**
   * Cap how many of the supplied chips show inline; the rest collapse behind a
   * trailing "See more" chip whose `Popover` lists them. Omit to show every chip.
   */
  max?: number;
  /**
   * Label for the overflow "See more" chip. Pass a string, or a function of the
   * hidden count (e.g. `(n) => `+${n}``). Defaults to `"See more"`.
   */
  seeMoreLabel?: string | ((remaining: number) => string);
  ref?: React.Ref<HTMLUListElement>;
}

/**
 * Render a single item as a `<Chip>` inside its `<li>`. Item-level `intent`/
 * `saliency` win over the list defaults; `size` always comes from the list (the
 * item type omits it, applied after the spread so it can't be overridden at runtime).
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
    // Same Safari role-stripping fix as the `<ul>` below.
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
 * (default) or stacked in a column. Each chip is supplied as a `<ChipList.Item>`;
 * the list applies shared `intent`/`saliency` (overridable per item) and `size`
 * (applied to every chip, not overridable, and tunes their spacing).
 *
 * Pass `max` to cap how many chips show inline — the rest collapse behind a
 * trailing "See more" chip whose `Popover` lists them.
 *
 * The list is a real `<ul>`/`<li>` structure (`role="list"`/`role="listitem"`),
 * announced as a list with one item per chip.
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
  // Resolve to keyed elements first (dropping falsy entries) so `max` counts and
  // slices real chips, and the shared keying rule applies.
  const resolved = keyedElements(items);
  const overflows = max != null && resolved.length > max;
  const visible = overflows ? resolved.slice(0, max) : resolved;
  const remaining = overflows ? resolved.slice(max) : [];

  const seeMoreText =
    typeof seeMoreLabel === "function" ? seeMoreLabel(remaining.length) : seeMoreLabel;

  return (
    // `role="list"` is explicit — Safari strips a `<ul>`'s implicit list role
    // once `list-style: none` is applied.
    <ul
      ref={ref}
      role="list"
      className={cx(chipListRoot({ orientation, size }), className)}
      {...rest}
    >
      {visible.map((item) => (
        <ChipListRow key={item.key} item={item} intent={intent} saliency={saliency} size={size} />
      ))}

      {/* Overflow chip: a popover trigger whose surface lists the hidden chips
          as their own (vertical) ChipList. */}
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
