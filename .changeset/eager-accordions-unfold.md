---
"@saintly-software/baritone": minor
---

Add an `Accordion` component.

A vertical stack of collapsible items, built on base-ui's `Accordion` (each item
gets a heading + disclosure `button` + a `region` panel, with the ARIA wiring and
keyboard handling done for you). Each item is a "surface" (like `Card`); its
`header` is typically an `<Accordion.ItemHeader />` and its `children` are the
panel content.

- **Type-safe over its values (like `Tabs`):** generic over `T`, inferred from
  the `items` array with a `const` type parameter so string/number literals
  survive without `as const`. Each item's `value` and the open-value props are
  bound to that same union/enum — a stray value is a compile error (`NoInfer`
  keeps `T` coming from `items` alone).
- **`multiple` is a discriminated union (like `FileUpload`):** omitted/`false`
  keeps one item open at a time, so `value` / `onChange` / `initialValue` speak a
  single `T | null`; `multiple` lets any number open, so they speak a `T[]`. A
  mismatched pair is a type error.
- **Controlled vs uncontrolled is a discriminated union (like `Tabs`):** pass
  `value` + `onChange` to drive it, or `initialValue` (or nothing) to let it
  manage its own state.
- **`Accordion.ItemHeader`:** renders an item's trigger content as a `title` with
  an optional `subtitle`; the surrounding `<h3>`, `<button>`, and disclosure
  chevron are supplied by `Accordion` itself.
- **`disabled`:** dims a single item or the whole group and vetoes toggling, but
  every trigger stays keyboard-reachable (`aria-disabled` on the root + a per-item
  veto via base-ui's open-change event, never the native attribute — see
  AGENTS.md).
