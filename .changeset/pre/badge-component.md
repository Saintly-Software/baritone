---
"@saintly-software/baritone": minor
---

Add a `Badge` component — a small "component" element type indicator sharing the
`intent` / `saliency` / `size` colour scheme with `Chip`/`Button`.

Its content is one of four mutually-exclusive shapes:

- **`icon`** — an icon (typically an `<Icon>`, which inherits the badge colour).
- **`count`** — a number. Pair with **`max`** to cap it: when `count` exceeds
  `max` the badge renders `{max}+` (e.g. `count={100} max={99}` → `99+`).
- **`text`** — a short string (e.g. `NEW`).
- **none** — a bare dot indicator.

A single glyph stays circular; wider content (a multi-digit count, short word)
grows into a pill.
