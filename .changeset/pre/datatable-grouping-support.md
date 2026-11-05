---
"@saintly-software/baritone": minor
---

Add row grouping to `DataTable` — pass `grouping` (an ordered list of column ids)
to gather rows under collapsible group headers.

- **`grouping` prop:** a controlled `ReadonlyArray<string>` of column ids. The
  table groups by the first id, then by the second within each group, and so on;
  omit it (or pass `[]`) for the flat table as before. It's controlled by design —
  the table renders whatever you pass, so drive it from a "group by" control or a
  static config — and the table owns only the expand/collapse state.
- **Collapsible groups:** each distinct value gets a header row carrying an
  expand/collapse toggle (a real `<button>` with `aria-expanded` and an
  `Expand`/`Collapse` label), the group's value, and its row count. Groups start
  expanded; `defaultExpanded={false}` starts them all collapsed. Nested groups
  indent by depth.
- **Per-group aggregates:** a column's `aggregationFn` (the built-in `"sum"`,
  `"count"`, `"min"`, `"max"`, `"mean"`, … resolve by name, or pass your own) with
  an optional `aggregatedCell` renders a rolled-up value on the group header rows.
- **Built on v9 feature plugins:** `columnGroupingFeature`, `rowExpandingFeature`,
  and `rowAggregationFeature` (plus the grouped/expanded row models and the
  built-in aggregation registry) now ship in `dataTableFeatures`. They're inert
  without `grouping`, so a plain `DataTable` is unchanged. No new prop is required
  and no existing call site needs to change — sorting / filtering / pagination
  remain future plugins that slot in the same way.
