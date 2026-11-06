---
"@saintly-software/baritone": minor
---

Add a `RadioGroup` component.

A "form control" element type for picking one value from a small set. Built on
base-ui's `RadioGroup` (roving focus, arrow-key navigation, ARIA `radiogroup`
wiring) and wrapped in a `Field` for label / description / error association,
like `TextInput`.

- **Type-safe compound component:** the group is generic over the value type
  `T` (inferred from `value`), and hands its render-prop a `RadioGroupItem`
  bound to that `T` — so an option outside the union/enum is a compile error.
  Works for any enum, not just one.
- **Validation:** `state` accepts `neutral` / `invalid` / `valid`; `invalid`
  shows `errorMessage` through `Field.Error` and is announced.
- **Layout:** `orientation` lays options out in a column (default) or a row.
- **Labelling:** each item's visible label doubles as its accessible name via
  explicit `aria-labelledby`, since the `role="radio"` element isn't the one a
  wrapping `<label>` would otherwise name.
