---
"@saintly-software/baritone": minor
---

Add an `InfoButton` component.

A small icon-only "i" button that opens an informational `Popover` — the "more
about this" affordance next to a label or field. It composes the exported
`Popover` (so focus management, `Escape` / outside-click dismissal, and ARIA
wiring come for free) with an icon-only trigger built on the very same
`InternalButton` that powers `Button`.

- **Required `aria-label`:** the button is icon-only, so its accessible name is
  required — the mirror image of `Button`, which _forbids_ `aria-label` because
  its visible label is already the name.
- **`children`** are the popover body; **`header`** adds a title that also names
  the popover.
- **`icon`** defaults to an info glyph; **`intent`** (excludes `positive`,
  default `neutral`), **`saliency`** (default `low`), and **`size`** (default
  `sm`) style the trigger, shared with `Button` / `Chip`. The floating surface
  stays the default neutral `Popover`.
- **`side` / `align`** place the popover; **`disabled`** uses `aria-disabled`
  (keyboard-reachable, can surface `disabledReason`).
