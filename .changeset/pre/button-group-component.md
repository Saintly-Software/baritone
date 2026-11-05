---
"@saintly-software/baritone": minor
---

Add a `ButtonGroup` component (with `ButtonGroup.Item`).

A visually-joined cluster of buttons that share sizing and, by default,
intent/saliency — a row of real `<button>`s rendered through the same
`InternalButton` as `Button`, so every member matches a standalone `Button`
with the same props but with its inner corners squared off.

- **Joined surface:** the two ends keep the resting surface radius while the
  inner corners collapse to `0` (via logical corner properties, so it's
  RTL-correct), and abutting borders overlap into a single hairline seam
  (hover/focus lifts the active member's border and outline above its
  neighbours).
- **`items` API:** members are passed as `ButtonGroup.Item` elements — a
  config-only element the group reads props off of — in array order, which is
  also the DOM/keyboard tab order (ordinary tab stops, no roving tab stop).
- **Group-owned sizing:** `ButtonGroup.Item` is the `Button` API **minus
  `size`**; the group owns `size` so all members match. Group-level `intent` /
  `saliency` are defaults each member may override.
- **Independent actions:** unlike `ToggleGroup`, each member keeps its own
  `onClick`, icons, `loading`, and focusable-`aria-disabled` state (with the
  `disabledReason` tooltip).
