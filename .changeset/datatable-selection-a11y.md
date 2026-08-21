---
"@saintly-software/baritone": patch
---

Fix several `DataTable` row-selection accessibility gaps:

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
- **A non-selectable row never reads as checked.** If a seeded/controlled id
  points at a row the predicate excludes, its locked box no longer shows as
  checked (it couldn't be cleared) — the checked state is now gated on the row
  actually being selectable.
- **Larger tap target.** The per-row and select-all checkboxes now expose a 24px
  hit target (the WCAG 2.2 SC 2.5.8 minimum) around the 16px visual box, so the
  box is easier to hit on touch and for motor-impaired users.
