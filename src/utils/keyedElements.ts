import * as React from "react";

/**
 * Resolve an `items`-style element array to a keyed, render-ready list — the
 * shared rule behind `Menu` / `List` / `ChipList`'s `items` prop.
 *
 * - **Falsy entries are dropped** (`null` / `false` / `undefined`), so a row can
 *   be included conditionally inline (`cond && <X.Item …/>`) without a wrapper.
 * - **Each surviving element gets a stable key** — its own `key` when set,
 *   otherwise its *original* index in the array. Using the pre-filter index
 *   keeps keys stable when a conditional entry toggles: dropping an earlier row
 *   doesn't renumber (and so remount) the rows after it.
 * - A missing array (`undefined`) resolves to `[]` rather than throwing, so a
 *   loosely-typed caller renders an empty list.
 *
 * Returns the elements cloned with the resolved key, ready to render directly or
 * to read `.props` / `.key` off (for carriers like `ChipList.Item`).
 */
export function keyedElements<P>(
  items: ReadonlyArray<React.ReactElement<P> | null | false | undefined> | undefined,
): React.ReactElement<P>[] {
  const resolved: React.ReactElement<P>[] = [];
  (items ?? []).forEach((item, index) => {
    if (!item) return;
    const keyed = React.cloneElement(item as React.ReactElement, {
      key: item.key ?? index,
    }) as React.ReactElement<P>;
    resolved.push(keyed);
  });
  return resolved;
}
