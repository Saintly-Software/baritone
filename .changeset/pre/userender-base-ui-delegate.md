---
"@saintly-software/baritone": minor
---

`useRender` now delegates to base-ui's own `useRender` instead of a parallel
hand-rolled implementation, inheriting base-ui's ref-merging, event-handler
chaining, and `preventBaseUIHandler` support.

**Breaking:** `defaultElement` is now typed as — and restricted to — an intrinsic
tag name (`keyof JSX.IntrinsicElements`) rather than any `ElementType`. The old
implementation rendered a component-valued `defaultElement` via `createElement`;
base-ui renders only string tags, so a component default is no longer accepted at
either the type level or runtime. To render _as_ a component, use the `render`
prop (`render={<Component />}`) — always its intended role.

One more note for direct `useRender` consumers: an element that defaults to
`<button>` now receives `type="button"` unless you pass a `type`, matching
base-ui (keeps an in-form button from submitting).
