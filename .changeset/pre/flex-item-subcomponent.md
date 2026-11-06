---
"@saintly-software/baritone": minor
---

Add a `Flex.Item` sub-component — a flex child exposing per-child layout knobs so
a single child can override the container without reaching for `atoms` directly.
It's purely optional: plain children still work fine inside `Flex`.

Renders a `<div>` by default and maps friendly props onto the atoms scale:

- **`align` / `alignSelf`** — `align-self` in friendly terms (`start` / `center`
  / `end` / `stretch` / `baseline` / `auto`). `alignSelf` wins if both are set.
- **`grow` / `shrink`** — `flex-grow` / `flex-shrink` as booleans (`grow` → `1`,
  `shrink={false}` → `0`).
- **`width` / `height` / `minWidth` / `minHeight`** — sizing from the atoms scale
  (spacing tokens plus `full`, `auto`, `fit-content`, `max-content`,
  `min-content`), each responsive-capable.
- **Spacing shorthands** (`m` / `mx` / … and `p` / `px` / …) wired to the spacing
  scale, plus `render`, `className`, `ref`, `children`, and the rest of
  `HTMLAttributes`.

The sizing atoms (`alignSelf`, `flexGrow`, `flexShrink`, `height`, `minWidth`,
`minHeight`, and an expanded `width`) are also available via `atoms`.
