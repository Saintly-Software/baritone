---
"@saintly-software/baritone": minor
---

Add a `Tabs` component.

A horizontal tablist for switching the active view, built on base-ui's `Tabs`
(roving focus, arrow-key navigation, `tablist` / `tab` ARIA wiring). It renders
only the tab strip — the content for each `value` is yours to show — and styles
the active tab with the "component" colour family (`intent` x `saliency`).

- **Type-safe over its values (like `RadioGroup`):** generic over `T`, inferred
  from the `tabs` array with a `const` type parameter so string/number literals
  survive without `as const`. Each tab's `value`, the controlled `value`, and the
  uncontrolled `initialValue` are all bound to that same union/enum — a stray
  value is a compile error (`NoInfer` keeps `T` coming from `tabs` alone).
- **Controlled vs uncontrolled is a discriminated union:** pass `value` +
  `onChange` to drive it, or `initialValue` (or nothing — it seeds to the first
  enabled tab) to let it manage its own state. Mixing the two is a type error.
- **`saliency`** (+ `intent`, default `neutral`): the active tab takes the
  `high` (filled) / `mid` (washed) / `low` (transparent + border) colour block,
  matching `Chip` / `Button`.
- **`Tabs.Item` props** (`tabs` array entries): `value`, `label`, plus optional
  `disabled` and `leadIcon` / `trailIcon`.
- **`disabled`:** dims the whole strip and vetoes selection, but the active tab
  stays keyboard-reachable (`aria-disabled`, never the native attribute — a
  disabled tab's selection is cancelled via base-ui's change event). A single
  `disabled` tab stays focusable-but-inert the same way.
