---
"@saintly-software/baritone": minor
---

Add a `DataTable` component — renders a set of columns and rows as a semantic
`<table>`, built on TanStack React Table v9.

- **Headless engine, house markup:** TanStack owns the row/column model; the
  component owns the `<table>`/`<caption>`/`<thead>`/`<tbody>` markup, the
  vanilla-extract styling, and the accessibility. This first version renders the
  columns you pass — sorting / filtering / pagination are v9 feature plugins that
  register into the same feature set later, without changing this prop surface.
- **TanStack-native columns:** pass `data` and `columns` (TanStack `ColumnDef`s).
  Build the columns with the exported `createDataTableColumnHelper<T>()` — a
  helper pre-bound to the component's feature set, so callers never repeat the
  feature generic — for full per-column value inference and custom `cell`
  renderers. Raw `createColumnHelper` / `ColumnDef` stay importable from
  `@tanstack/react-table` for advanced use.
- **Required accessible name:** pass exactly one of `caption` (a visible
  `<caption>` that also names the table), `aria-label`, or `aria-labelledby` — a
  union type makes providing none, or two, a compile error (mirrors `CardList`).
- **Column alignment:** set a column's `meta.align` (`start` / `center` / `end`),
  wired through v9's type-only `columnMeta` slot so it stays a real style recipe
  variant rather than a parallel column API.
- **`getRowId`** for stable, reorder-proof row keys, and an **`empty`** slot
  rendered as a single cell spanning every column when there are no rows.
- **New peer dependency:** `@tanstack/react-table` (`^9.0.0-beta.53`). Consumers
  installing `DataTable` must add it alongside the existing `@base-ui/react` peer.
