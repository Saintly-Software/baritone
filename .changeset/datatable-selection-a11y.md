---
"@saintly-software/baritone": patch
---

Fix two `DataTable` row-selection accessibility gaps:

- **Distinct per-row checkbox names.** Each row's selection box previously shared
  the generic accessible name "Select row", so assistive-tech users couldn't tell
  the rows apart. The box now leads with the row's first primitive cell value
  (e.g. "Select Ada Lovelace"), mirroring the group box's `Select all rows in
  <value>`, and falls back to "Select row" when that cell has no sensible string
  form.
- **Lock the "select all" box when nothing is selectable.** When an
  `enableRowSelection` predicate excludes every row (or there are no rows), the
  header box is now locked (dimmed + `aria-disabled`, still focusable) instead of
  being a focusable no-op — matching the treatment already given to a group
  header whose rows are all non-selectable.
