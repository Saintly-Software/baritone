---
"@saintly-software/baritone": minor
---

Add `multiline`, `info`, and `slotProps` to `TextInput`.

- **`multiline`** — renders a native `<textarea>` instead of an `<input>`, as a
  discriminated-union arm. Its height is driven by `rows` (default `3`); `rows`
  and the single-line `size` are mutually exclusive at the type level. The
  textarea is vertically resizable and keeps the same `state` model, ARIA wiring,
  and `aria-disabled` + `readOnly` disabled behaviour as the input.
- **`info`** — extra explanation surfaced in an `InfoButton` (the "i" affordance)
  next to the `label`. Only rendered when there's a visible `label`. Name the
  button via `slotProps.info["aria-label"]` (defaults to "More information").
- **`slotProps`** — per-slot overrides for the `label` / `description` / `info`
  pieces. A `className` set on a slot merges onto (doesn't replace) the built-in
  class.

Also exports `TextInputSlotProps`, `SingleLineTextInputProps`, and
`MultilineTextInputProps`.
