---
"@saintly-software/baritone": minor
---

Add `description`, a value read-out, and per-slot overrides to `Meter`.

- **`description`** — supporting text beneath the track, wired to the meter as
  its `aria-describedby`.
- **`showValue`** — render the current value at the end of the header row
  (decorative / `aria-hidden`; the value still reaches assistive tech via
  `aria-valuenow` / `aria-valuetext`). Customise it with `format` /
  `locale` (an `Intl.NumberFormat` bag) or take full control with `formatValue`.
- **`slotProps`** — `Partial<TextProps>` overrides for the `label` / `value` /
  `description` `Text` slots.

The existing `aria-valuetext` formatter is unchanged. Meters with none of the
new props render as before.
