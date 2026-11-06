---
"@saintly-software/baritone": minor
---

Add `labelPosition`, `description` / `errorMessage`, and `aria-label` /
`aria-labelledby` to `Switch`, bringing it in line with the other form controls.

- **`labelPosition`** — `"top" | "start" | "end"` (default `end`). Placed with
  flex direction only, so `start`/`end` are inline-logical (RTL-safe) and the DOM
  order — and the accessible name — never move.
- **`description`** — inline help under the row, wired to the control via
  `aria-describedby` (like `TextInput` / `RadioGroup`). Named `description` to
  match the rest of baritone's form controls rather than Rain's `helpText`.
- **`errorMessage`** — validation text shown and announced under the row when the
  switch is `invalid`.
- **`aria-label` / `aria-labelledby`** — name the control when there's no visible
  `label` (e.g. an icon-only switch); a visible `label` and an explicit
  `aria-labelledby` both take precedence over `aria-label`.

The `value` prop remains the _checked state_, not a form-submission value — the
same design note as `Checkbox`; base-ui's native string `value` is intentionally
not surfaced.
