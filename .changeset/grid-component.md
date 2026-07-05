---
"@saintly-software/baritone": minor
---

Add a `Grid` component — the CSS-grid counterpart to `Flex`, so common
two-dimensional layouts don't have to reach for `atoms` directly.

Renders a `<div>` with `display: grid` (or `inline-grid` via `inline`) and maps
friendly props onto the grid/spacing tokens:

- **`columns` / `rows`:** a number expands to that many equal tracks
  (`repeat(n, minmax(0, 1fr))`), or pass any `grid-template-*` string
  (`"200px 1fr"`, `"repeat(auto-fill, minmax(8rem, 1fr))"`) verbatim.
- **`areas`:** `grid-template-areas` without the footguns. Pass an array of rows
  (`["header header", "nav main"]`) or a multi-line string — you write the cell
  names and Grid adds the required per-row quotes (leaving already-quoted rows
  alone and ignoring blank/indented lines). Exposed standalone as
  `toGridTemplateAreas` too.
- **`align` / `justify`:** friendly values (`start` / `center` / `end` /
  `between` / `around` / `evenly`, plus `stretch` / `baseline` for `align`)
  mapped to the `align-items` / `justify-content` keywords.
- **`gap`, `inline`:** the gap token and `inline-grid`.
- **Spacing shorthands:** `m` / `mx` / `my` / `mt` / `mr` / `mb` / `ml` and
  `p` / `px` / `py` / `pt` / `pr` / `pb` / `pl`, wired straight to the spacing
  scale (each responsive-capable).
- **`render`:** swap the element via the base-ui `render` pattern.

Also adds `inline-grid` to the `display` sprinkle.
