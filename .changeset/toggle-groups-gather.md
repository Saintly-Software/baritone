---
"@saintly-software/baritone": minor
---

Add a `ToggleGroup` component.

A single-select segmented control — a row of toggle buttons where exactly one is
selected — built on base-ui's `ToggleGroup` / `Toggle` (roving focus, arrow-key
navigation, `group` ARIA wiring) and rendered with the same `InternalButton` that
powers `Button`. The selected segment takes the "component" colour family
(`intent` x `saliency`); unselected segments drop to a neutral `low` ghost.

- **Type-safe over its values (like `RadioGroup`):** generic over `T`, inferred
  from `value`, with a render-prop that hands back a `ToggleGroupItem` bound to
  that same `T` — so a segment's `value` can only ever be a member of the same
  union/enum, and a stray value is a compile error. `T` is constrained to
  `string` (base-ui keys toggles by string).
- **`intent` / `saliency` / `size`:** the selected segment's look, shared with
  `Button` / `Chip`. `saliency` defaults to `high` (filled).
- **Keyboard — a toolbar-style roving tab stop, not a radio group (selection is
  manual, not on focus):** Tab moves into the group and lands on the _selected_
  segment; the arrow keys move focus between segments _without_ selecting; Enter
  (or Space) selects the focused segment.
- **`disabled`:** dims the whole group and vetoes selection, but every segment
  stays keyboard-reachable — you can still Tab in and arrow between segments, you
  just can't change the value. Modelled with `aria-disabled` on the container + a
  veto in the change handler, never the native attribute (see AGENTS.md).
