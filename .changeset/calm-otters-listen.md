---
"@saintly-software/baritone": minor
---

Add a `CheckboxGroup` component.

A "form control" element type for picking *any number* of values from a small
set — the multi-select sibling of `RadioGroup`: same `Field`-wrapped label /
description / error layout, same type-safe compound API, but the selection is
an array and each option is an independent checkbox (no roving focus — every
box is its own tab stop).

- **Type-safe compound component:** the group is generic over the value type
  `T` (inferred from `value`), and hands its render-prop a `CheckboxGroupItem`
  bound to that `T` — so an option outside the union/enum is a compile error.
- **Per-row behaviour:** each row is the same box + label as the standalone
  `Checkbox` (base-ui's `Checkbox.Root` + `InternalCheckbox`); the group itself
  is a labelled `role="group"`, so the whole control reads as one named set.
- **Validation:** `state` accepts `neutral` / `invalid` / `valid`; `invalid`
  shows `errorMessage` through `Field.Error` and is announced.
- **Layout:** `orientation` lays options out in a column (default) or a row.
