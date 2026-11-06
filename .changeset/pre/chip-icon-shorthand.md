---
"@saintly-software/baritone": minor
---

Add an `icon` shorthand prop to `Chip`.

`icon` is a convenience for a single leading `Chip.Adornment`: pass an icon and
it renders as the **first** lead adornment, ahead of anything in
`leadAdornments`. It's decorative and inherits the chip's colour like any
adornment — equivalent to prepending `<Chip.Adornment icon={…} />` yourself.
