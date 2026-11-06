---
"@saintly-software/baritone": minor
---

Add row selection to `DataTable` — set `enableRowSelection` to grow a leading
checkbox column with a "select all" box in the header and a checkbox per row.

- **`enableRowSelection` prop:** `true` makes every row selectable, or pass a
  predicate `(row) => boolean` to allow it only for some — the rest render a
  locked box (dimmed + `aria-disabled`, never the native `disabled` attribute, so
  it stays focusable per the house convention), and "select all" skips them.
  Omit for no selection column, so an existing `DataTable` is unchanged.
- **Controlled or uncontrolled selection:** drive it with `selectedRowIds` +
  `onSelectionChange` (controlled), or seed `defaultSelectedRowIds` and let the
  table own the state (uncontrolled) — the same split as `ToggleButton`.
  `onSelectionChange(ids, rows)` fires in both modes with the selected ids (the
  source of truth — an id can outlive a row paged/filtered out of `data`) and the
  matching rows from the current `data`. Pair with a stable `getRowId`.
- **Select-all + indeterminate:** the header box selects or clears every
  selectable row and shows the mixed dash on a partial selection.
- **Shift-click ranges:** Shift-clicking a second box selects the inclusive range
  from the last one, via TanStack's own range handler (React surfaces the
  modifier through the change event's `nativeEvent`).
- **Composes with grouping:** each group header also carries a tri-state box that
  selects or clears all of its rows at once and reflects all / some / none.
- **Built on the v9 `rowSelectionFeature`,** now registered in
  `dataTableFeatures`. It's forced off (`enableRowSelection: false`) until you opt
  in, and the checkbox reuses the presentational `InternalCheckbox` behind a real,
  focusable `<input type="checkbox">`. No existing call site needs to change.
