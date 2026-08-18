---
"@saintly-software/baritone": minor
---

Add a `List` component (with a `List.Item` part) — a semantic list (`<ul>`, or
`<ol>` when `ordered`) whose items are laid out with either flexbox or CSS grid.

- **`layout`:** `flex` (default) or `grid`, the discriminant of the prop union —
  the layout-specific knobs only type-check for the matching layout. `List`
  delegates to `Flex` / `Grid` via the base-ui `render` pattern, so the layout
  props behave exactly as they do on those primitives.
- **Flex knobs (`layout="flex"`):** `direction`, `align`, `justify`, `wrap`,
  and `gap`.
- **Grid knobs (`layout="grid"`):** `columns`, `rows`, `areas`, `justify`, and
  `gap` — place items in named areas with `List.Item`'s `area` (sets
  `grid-area`).
- **`ordered`:** render an `<ol>` (semantic sequence) rather than a `<ul>`. The
  marker is stripped either way (it doesn't flow through flex/grid tracks), so
  `ordered` only changes the element.
- **`items`:** pass an `items` array of `<List.Item>` elements (keyed by each
  entry's `key`, falling back to index).
- **Real list semantics:** the `<ul>`/`<ol>` margin, padding, and marker are
  reset so the layout drives all spacing, and a `role="list"` is kept explicitly
  (Safari strips it under `list-style: none`); each `List.Item` is an `<li>` with
  an explicit `role="listitem"`. Use `render` to swap the element.
