---
"@saintly-software/baritone": minor
---

Add a `Flex` component — a flexbox container primitive so common layouts don't
have to reach for `atoms` directly.

Renders a `<div>` with `display: flex` (or `inline-flex` via `inline`) and maps
friendly props onto the spacing/flex tokens:

- **`align` / `justify`:** friendly values (`start` / `center` / `end` /
  `between` / `around` / `evenly`, plus `stretch` / `baseline` for `align`)
  mapped to the `align-items` / `justify-content` keywords.
- **`direction`:** `row` (default) or `column`. The `*-reverse` directions are
  intentionally unsupported — they flip the visual order without touching the
  DOM order, desyncing reading/tab order from the screen. Reorder children
  instead.
- **`gap`, `wrap`, `inline`:** the gap token, `flex-wrap`, and `inline-flex`.
- **Spacing shorthands:** `m` / `mx` / `my` / `mt` / `mr` / `mb` / `ml` and
  `p` / `px` / `py` / `pt` / `pr` / `pb` / `pl`, wired straight to the spacing
  scale (each responsive-capable).
- **`render`:** swap the element via the base-ui `render` pattern.
