---
"@saintly-software/baritone": minor
---

Add a public `LoadingIndicator` component (spinner).

- Wraps the system's shared `InternalSpinner` (the same pure-CSS ring behind
  `Button`/`Chip` loading states) in a standalone, accessible shell.
- By default it announces an `SrOnly` **"Loading"** label under `role="status"`,
  keeping the ring itself decorative (`aria-hidden`). Pass a custom `label` to
  reword the announcement.
- Pass `aria-hidden` to render the ring purely decoratively — the label, `role`,
  and live region are all dropped — for hosts that convey the busy state
  themselves (e.g. via `aria-busy`).
- `size` (`sm`/`md`/`lg`) tracks `Icon`'s ramp; colour comes from `intent` /
  `saliency` when standalone, or follows the surrounding text inside
  `Text`/`Chip` (via `--iconColor`). A `variant` axis is reserved (only
  `"spinner"` today).
- Honours `prefers-reduced-motion` (the ring eases to a slow rotation), and
  supports the `render` prop for polymorphism.
