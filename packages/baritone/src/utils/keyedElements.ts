import * as React from "react";

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
