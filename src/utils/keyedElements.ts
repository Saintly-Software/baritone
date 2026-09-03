import * as React from "react";

/**
 * Resolve an `items`-style element array to a keyed, render-ready list — the
 * shared rule behind `Menu` / `List` / `ChipList`'s `items` prop.
 *
 * - **Falsy entries are dropped** (`null` / `false` / `undefined`), so a row
 *   can be included conditionally inline (`cond && <X.Item …/>`).
 * - **Each surviving element gets a stable key** — its own `key` when set,
 *   otherwise its *original* index, so a toggled conditional entry doesn't
 *   renumber (and remount) the rows after it.
 * - A missing array (`undefined`) resolves to `[]` rather than throwing.
 *
 * Returns the elements cloned with the resolved key, ready to render directly
 * or to read `.props` / `.key` off (for carriers like `ChipList.Item`).
 */
export function keyedElements<P>(
  items: ReadonlyArray<React.ReactElement<P> | null | false | undefined> | undefined,
): React.ReactElement<P>[] {
  const resolved: React.ReactElement<P>[] = [];
  (items ?? []).forEach((item, index) => {
    if (!item) return;
    // Cast around `cloneElement`'s overloads, which don't resolve for a generic
    // `P`; we only ever inject a `key`, so the element type is preserved.
    const keyed = React.cloneElement(item as React.ReactElement, {
      key: item.key ?? index,
    }) as React.ReactElement<P>;
    resolved.push(keyed);
  });
  return resolved;
}
