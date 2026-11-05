---
"@saintly-software/baritone": minor
---

Add an `InaccessibleTooltip` component.

A consumer-facing escape hatch for attaching a tooltip to an _arbitrary_ element
on hover/focus. It composes the (still-unexported) `InternalTooltip`, so it
reuses the system's tooltip surface for visual consistency.

- **Bluntly named on purpose:** tooltips are kept off the public surface because
  the pattern is easy to misuse (invisible to touch, easy to overlook). This
  hands consumers the pattern anyway, under a name that keeps the tradeoff
  visible at every call site.
- **Accessibility is on the caller:** the tooltip is only keyboard/focus
  reachable when the wrapped element is itself focusable. Wrapping a plain
  `<div>` / `<span>` makes it mouse-hover only — never put information here that
  the UI can't function without.
- **Same surface, same knobs:** forwards `content`, `side` / `align` /
  `sideOffset`, `delay` / `closeDelay`, controlled `open` state, and `disabled`
  through to `InternalTooltip`.

For anything a user actually needs to read, prefer `Popover` (once it lands).
