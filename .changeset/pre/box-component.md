---
"@saintly-software/baritone": minor
---

Add a `Box` component — a plain element primitive so spacing doesn't have to
reach for `atoms` directly. It's the layout-neutral sibling of `Flex`: no
`display: flex`, just a box you can pad, margin, and style.

Renders a `<div>` by default and maps friendly props onto the spacing tokens:

- **Spacing shorthands:** `m` / `mx` / `my` / `mt` / `mr` / `mb` / `ml` (margin,
  supports `auto`) and `p` / `px` / `py` / `pt` / `pr` / `pb` / `pl` (padding),
  wired straight to the spacing scale (each responsive-capable).
- **`as`:** render as a different tag — `div` (default), `span`, `section`, or
  `article`.
- `className`, `ref`, `children`, and the rest of `HTMLAttributes` flow through.
