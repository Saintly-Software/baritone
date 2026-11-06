---
"@saintly-software/baritone": minor
---

Add expandable row detail panels to `DataTable` — pass `renderDetailPanel` to give
each row a disclosure toggle that reveals a full-width panel beneath it.

- **`renderDetailPanel` prop:** `(row) => ReactNode`, called with the row's own
  datum. Providing it grows a leading expander column; clicking a row's chevron
  reveals a full-width panel (spanning every column) rendered from that datum —
  `renderDetailPanel={(person) => <RowDetails person={person} />}`. Omit for no
  expansion column, so an existing `DataTable` is unchanged.
- **Lazy + independent:** panels start collapsed and toggle independently, and the
  render function runs only for open rows — an expensive panel costs nothing until
  it's opened. The table owns the expanded/collapsed state; pair with a stable
  `getRowId` so an open panel stays pinned to its row when `data` reorders.
- **`enableRowExpansion` gate:** narrow which rows can expand, mirroring
  `enableRowSelection`'s shape — `true` (the default) opens every data row, a
  predicate `(row) => boolean` allows it only for some (the rest show no toggle,
  just an empty expander cell), and `false` turns the feature off entirely,
  dropping the expander column even when `renderDetailPanel` is set.
- **Accessible disclosure:** each toggle is a real `<button>` with `aria-expanded`
  and, when open, `aria-controls` pointing at its panel, plus a row-specific
  `aria-label` ("Expand details for …"). Its expanded/collapsed chevron mirrors
  the group toggle and honours reduced motion.
- **Composes with selection and grouping:** the expander sits alongside the
  selection checkbox column, and group-header rows keep their own toggle while
  every data row gets a detail toggle.
- **Kept out of the grouping stack's expansion state:** detail expansion is
  tracked in the table's own state, separate from TanStack's `state.expanded`
  (which the grouping stack seeds to "all open"), so panels default to collapsed.
  No existing call site needs to change.
