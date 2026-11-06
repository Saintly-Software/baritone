---
"@saintly-software/baritone": minor
---

Add an opt-in `clearable` prop to `ToggleGroup` for a null (unselected) value.

By default `ToggleGroup` stays strictly single-select — exactly one segment is
always selected, and re-pressing the active segment is vetoed. Pass `clearable`
to allow an empty state:

- **`value` widens to `T | null`:** pass `null` to render the group with nothing
  selected (e.g. a control that starts empty).
- **Re-pressing the active segment clears it:** `onChange` widens to
  `(value: T | null, event) => void` and fires with `null` when the current
  selection is toggled off.

The prop is discriminated: without `clearable`, `value`/`onChange` keep their
strict `T` types, so existing usage is unchanged. When nothing is selected there
is no roving tab-stop marker, so Tab lands on the first segment.
