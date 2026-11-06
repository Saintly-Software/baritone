---
"@saintly-software/baritone": minor
---

Extract the margin/padding props into reusable `MarginProps` and `PaddingProps`
interfaces, and add spacing props to `Text` and `Heading`.

- **`MarginProps` / `PaddingProps`:** the `m` / `mx` / `my` / `mt` / `mr` / `mb`
  / `ml` (margin, supports `auto`) and `p` / `px` / `py` / `pt` / `pr` / `pb` /
  `pl` (padding) prop sets, wired to the spacing scale (each responsive-capable),
  now live in one shared place and are exported from the package root. `Box`,
  `Flex`, and `Grid` consume them instead of re-declaring the props inline — no
  change to their public API.
- **`Text` / `Heading`:** gain the full margin/padding shorthand props, so text
  and titles can be spaced without wrapping them in a layout primitive.
