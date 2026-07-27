---
"@saintly-software/baritone": minor
---

Add viewport-sizing, `place-items`/`place-content`, and `position`/inset atoms —
the layout-foundation knobs `Box` / `Flex` / `Grid` were missing, so full-height
regions, both-axes centering, and sticky bars no longer need inline styles or raw
CSS. All flow through the existing responsive conditions (`mobile` / `sm` / `md` /
`lg` / `xl`).

- **Viewport-fill height token:** the height axis (`minHeight` / `height` /
  `maxHeight`) gains `screen` → `100dvh` (the _dynamic_ viewport unit, so a
  full-height region tracks the mobile URL bar instead of overflowing like raw
  `100vh`), plus `screen-s` → `100svh` and `screen-l` → `100lvh` for a height that
  ignores the URL bar. `maxHeight` is new as an atom/prop. There's deliberately no
  viewport-_width_ token — use `width="full"`.
- **`Grid` `placeItems` / `placeContent`:** friendly `start` / `center` / `end` /
  `stretch` (responsive-capable). `placeItems="center"` is the one-prop way to
  center children on both axes — pair it with `minHeight="screen"` for a centered
  splash/empty state.
- **`position` + inset atoms:** `position` (`static` / `relative` / `absolute` /
  `sticky` / `fixed`) plus `inset` / `top` / `right` / `bottom` / `left` from the
  spacing scale (or `auto`). A sticky region is now `position="sticky" top="0"`.
- **Surfaced on the primitives:** `Box` and `Grid` gain the height (`SizingProps`)
  and positioning (`PositionProps`) props; `Flex` (and `Flex.Item`) pick up
  `maxHeight`, and `Flex` also gains the positioning props. The new `SizingProps`
  and `PositionProps` interfaces are exported from the package root alongside
  `MarginProps` / `PaddingProps`, and every new key is available on `atoms`.

```tsx
// Full-height, both-axes centered — no inline styles.
<Grid placeItems="center" minHeight="screen">
  <Spinner />
</Grid>

// Sticky bar.
<Flex justify="between" position="sticky" top="0" p="3">
  …
</Flex>
```
