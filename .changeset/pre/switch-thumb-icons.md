---
"@saintly-software/baritone": minor
---

Add optional thumb icons to `Switch`.

A glyph can now ride inside the sliding thumb, via a discriminated union so the
two spellings can't be mixed:

- **`icon`** — a single glyph reused for _both_ states; it stays in the thumb
  whether the switch is on or off.
- **`activeIcon` + `inactiveIcon`** — a _different_ glyph per state (e.g. a check
  when on, a cross when off); both are required together.

The glyph is decorative — the switch's accessible name still comes from `label`.
Pass a bare `currentColor` `<svg>` (or an `<Icon>`); it's sized to the thumb and
recoloured with the track's surface so it reads as a cut-out against the solid
thumb fill (accent when checked, neutral when off). The presentational
`InternalSwitch` gains the matching `activeIcon` / `inactiveIcon` props.
