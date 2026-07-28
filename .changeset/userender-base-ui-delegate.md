---
"@saintly-software/baritone": patch
---

`useRender` now delegates to base-ui's own `useRender` instead of a parallel
hand-rolled implementation, inheriting base-ui's ref-merging, event-handler
chaining, and `preventBaseUIHandler` support. The
`{ render, defaultElement, props }` signature is unchanged and behaviour is
preserved for all supported usage.

Two edge notes for direct `useRender` consumers:

- `defaultElement` must be an intrinsic tag string (`"div"`, `"a"`, …) — that was
  always its documented role. Passing a _component_ as `defaultElement` with no
  `render` now throws; render as a component via `render={<Component />}` instead.
- A `useRender` element that defaults to `<button>` now receives `type="button"`
  unless you pass a `type`, matching base-ui (keeps an in-form button from
  submitting).
