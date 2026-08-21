---
"@saintly-software/baritone": minor
---

Add `groupDisplay` to `DataTable` — render a grouped table as one indented
outline column instead of a separate grouped column.

- **`groupDisplay` prop:** `"columns"` (default) or `"merge"`. The default is
  unchanged — the grouped column stays its own column, with the label on header
  rows and a blank placeholder on leaves.
- **`"merge"`:** the grouped column(s) are not rendered as their own columns.
  The group label (value + expand/collapse toggle + count) is hosted in one
  column, and each leaf row renders that column's own value, both indented by
  nesting depth — so a _Category → Subcategory_ breakdown reads straight down a
  single outline column. Non-grouped columns (e.g. a summed `amount`) keep
  rendering normally, aggregates and all. Multi-level `grouping` indents
  progressively.
- **Choosing the host column:** by default the first non-grouped, non-aggregated
  column hosts the label — so a column with an `aggregationFn`/`aggregatedCell`
  keeps showing its per-group total rather than being replaced by the label; if
  every remaining column aggregates, the innermost grouped column stays on as the
  outline. Set a column's `meta.groupLabel: true` to host it elsewhere, and give
  the host column a `header` (e.g. `"Category"`) to name the outline.
- **Non-breaking:** additive prop that defaults to today's behavior; existing
  `DataTable` output and the prop surface are unchanged. The table keeps full
  `<table>` semantics — indentation is visual only, and the toggle keeps its
  `aria-expanded` and descriptive `aria-label`.
