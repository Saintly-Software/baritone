---
"@saintly-software/baritone": minor
---

Add `info`, `name`, and `slotProps` to `FileUpload`.

- **`info`** — extra explanation surfaced in an `InfoButton` (the "i" affordance)
  next to the `label`. Only rendered when there's a visible `label`. Name the
  button via `slotProps.info["aria-label"]` (defaults to "More information").
- **`name`** — native form field `name` on the underlying file `<input>`, so the
  control participates in `<form>` submission / `FormData`.
- **`slotProps`** — per-slot overrides for the `label` / `help` / `info` pieces.
  A `className` set on a slot merges onto (doesn't replace) the built-in class.
