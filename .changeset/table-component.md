---
"@saintly-software/baritone": minor
---

Add a plain `Table` component — renders a set of `columns` and `rows` as a
semantic `<table>` (`<thead>`/`<tbody>`, real `<th scope="col">` and `<td>`) with
no sorting, filtering, or pagination. Reach for `DataTable` when you need those;
use `Table` when the data is ready to show as-is.

- **The columns are the contract:** `Table` infers the union of the columns'
  `key`s and types `rows` against it, so a row that carries a key no column maps
  — or omits one a column needs — is a compile error. The strictness runs in both
  directions and needs no helper: write plain object literals for `columns` and
  `rows`.
- **Cells:** every row field is a `TableValue` (anything React can render). A
  column's optional `cell(value, row)` renderer wraps its value in any element
  (e.g. a `Link`, a currency-formatted number). When a column needs to _know_ its
  value is a `number` and format it with type safety, that's `DataTable`'s
  typed-accessor job; this plain table trades that for the strict key contract.
- **Alignment:** set a column's `align` (`start` / `center` / `end`), a real
  style recipe variant.
- **Naming & keys:** an optional `caption` renders a `<caption>` (which also names
  the table); pass `aria-label` / `aria-labelledby` (forwarded to the `<table>`)
  to name one without a visible caption. `getRowKey` derives stable React keys.
- **No new dependencies:** ships from the main entry point (unlike `DataTable`,
  which lives on its own subpath to keep the `@tanstack/react-table` peer out of
  the main barrel).
