---
"@saintly-software/baritone": minor
---

Add layout awareness: components can keep clear of an app's pinned navbar,
sidebar, footer and floating action buttons.

- `layoutVars` publishes `--bt-layout-inset-*`, `--bt-layout-fab-*` and
  `--bt-layout-offset` as stable, document-wide CSS variables.
- `useLayoutRegion({ edge, pinned, order })` / `useLayoutRegion({ corner })`
  register measured regions; same-edge regions stack, each with its own offset.
  `useLayoutInsets()` reads the values in JS.
- `BaritoneProvider` takes a `fab` reservation for third-party widgets.
- `Toast` stays above pinned bottom regions and any FAB in its corner.
- `html` now gets `scroll-padding-top: var(--bt-layout-inset-top, 0px)`.
- New `AppShell`: landmark grid with a skip link that registers its slots.
