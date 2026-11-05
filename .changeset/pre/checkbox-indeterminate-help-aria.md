---
"@saintly-software/baritone": minor
---

`Checkbox` gains a tri-state, inline help, and label-less naming — bringing it in
line with `TextInput` / `RadioGroup` / `CheckboxGroup`.

- **`indeterminate`** — shows the "mixed" dash and reports `aria-checked="mixed"`
  (the usual "select all" parent for a partly-selected set). Toggling still fires
  `onChange` with a resolved boolean.
- **`helpText` / `errorMessage`** — an inline line beneath the box. `helpText`
  wires the control's `aria-describedby`; `errorMessage` shows (and is announced)
  only when `state` is `invalid`.
- **`aria-label` / `aria-labelledby`** — name a label-less box (a table-row
  selector, say). A visible `label` still wins and names the box itself.

**Breaking:** the boolean `invalid` prop is replaced by `state?: FormState`
(`neutral` | `warning` | `invalid` | `valid`), matching the other form controls.
Replace `invalid` with `state="invalid"`.

`value` stays a single `boolean` (the checked state). Rain separates a boolean
`checked` from a string form `value`; we deliberately did **not** add a separate
form `value` here, to avoid silently repurposing the existing `value` prop —
`indeterminate` is layered on top as presentation only.
