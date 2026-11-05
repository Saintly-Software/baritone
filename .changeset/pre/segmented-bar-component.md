---
"@saintly-software/baritone": minor
---

Add `SegmentedBar` — one bar divided into the parts that make up a whole, with a
legend naming each part (time by project, spend by category, storage by type).
Where `Meter` shows one value against a range, this shows one whole split up.

- `segments` take a `label` and a raw `value`; the shares are computed, so callers
  pass counts rather than percentages. `total` sets the denominator explicitly —
  pass a number above their sum (a quota, a target) to leave the difference as
  unfilled track. Slices are sized by `flex-grow`, so they divide the track
  exactly, with a minimum width that keeps a sliver visible and a 2px gap
  separating neighbours instead of a stroke around each one.
- Each segment is coloured by `intent` × `saliency`, defaulting to a fixed
  sequence of intents so a bar is legible with nothing but labels and values.
  Assignment is by position — give segments an explicit colour when the set can
  change, or a filtered-out segment repaints the ones after it. A per-segment
  `color` is the escape hatch for fills that are _data_ (a user-chosen category
  colour), mutually exclusive with `intent`/`saliency` as `Badge`'s is.
- The legend is a real list, one item per segment carrying its label, share, and
  value; the track duplicates it, so the track is `aria-hidden` and colour is
  never the only thing carrying identity. `showLegend={false}` therefore hides it
  _visually only_ — it stays in the accessibility tree, since it's the only thing
  announcing the numbers. `showPercent` / `showValue` trim its columns.
- A visible `label` (which names the legend list) and an optional `showTotal`
  read-out sit above the track, mirroring `Meter`'s header; `size` sets the track
  thickness, `format` / `locale` format the values, and `slotProps` re-tune each
  `Text` slot.

Also exports `SegmentedBarProps`, `SegmentedBarSegment`, `SegmentedBarSegmentBase`,
`SegmentedBarSegmentIntentColour`, `SegmentedBarSegmentCustomColour`, and
`SegmentedBarSlotProps`.
