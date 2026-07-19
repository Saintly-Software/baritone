---
"@saintly-software/baritone": minor
---

Add a **grid view** to `Combobox` via a new `columns` prop. Pass a whole number
≥ 2 to tile the options into that many columns instead of a single column;
arrow keys then navigate in two dimensions. Best for short, tile-like options
(colours, icons, emoji).

- Built on base-ui's `grid` mode: the popup becomes a `role="grid"` of
  `role="row"`s of `role="gridcell"`s, and base-ui infers the columns from the
  DOM rows for 2-D arrow-key navigation.
- Fully backwards-compatible — omitting `columns` (or passing `< 2`) keeps the
  single-column list. Takes precedence over `virtualized` (whose flat-row
  windowing can't tile).
- Works with **groups** (each group tiles under its own heading), typeahead
  filtering (rows re-chunk as the list narrows), `freeText` (the "Add …" cell
  gets its own full-width row), and single / multiple selection.
- Selected cells read without relying on colour alone: a border ring plus a
  corner check, on top of the shared `data-selected` wash.

Follows the system conventions: the column count is the one caller-chosen value
a recipe can't enumerate, so it reaches CSS as a single dedicated `createVar`
set inline via `assignInlineVars` — the same single-hole pattern the colour
escape hatches use. Cell highlight / select washes reuse the list item's oklch
tokens, and grid cells (never tab stops) use base-ui's `disabled` for per-cell
`aria-disabled`, allowlisted in the disabled-convention guard.
