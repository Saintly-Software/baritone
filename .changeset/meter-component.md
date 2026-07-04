---
"@saintly-software/baritone": minor
---

Add a `Meter` component — a static, read-only gauge for a value within a known
range (storage used, score, capacity), built on base-ui's `Meter` for the
semantics (`role="meter"`, the `aria-value*` wiring, the value→percentage math)
with the system's colour scheme on top.

The filled indicator is coloured by `intent` × `saliency` — the same vocabulary
as `Chip` / `Button` — over a neutral track. Supports a visible `label` (wired up
as the accessible name) or `aria-label` / `aria-labelledby`, plus
`aria-valuetext` as either a fixed string or a function of the formatted and raw
value.

It is *not* a progress bar: use it for a measurement, not the completion of a
task.
