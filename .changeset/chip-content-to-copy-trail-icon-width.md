---
"@saintly-software/baritone": minor
---

Add three convenience props to `Chip`, all additive — the existing
`intent` / `saliency` / `size` / `shape` / `icon` / adornment / `onClick` /
`popover` / `handleRemove` API and the `Chip.Adornment` part are unchanged.

- **`contentToCopy`** — appends a built-in copy-to-clipboard trailing adornment.
  It's a labelled ("Copy") clickable `Chip.Adornment` that writes the string to
  the clipboard via the Clipboard API and briefly swaps to a checkmark + "Copied"
  as success feedback. Being clickable it inherits the chip's disabled state
  (inert but focusable). Sits after `trailIcon`, before the `handleRemove` "×".
- **`trailIcon`** — a trailing-icon shorthand mirroring the lead `icon`: a
  decorative `Chip.Adornment` appended after any `trailAdornments`.
- **`width`** — `"fit"` (default, `inline-flex` hugging content) or `"fill"`
  (block `flex` stretching to the container's full width); the label truncates
  either way.
