---
"@saintly-software/baritone": minor
---

Add a `ChipList` component for rendering a set of `Chip`s as a semantic list.

- **`items`** — each entry is a `Chip`'s props (`ChipListItem`), so chips keep
  their full API (adornments, clickable label, popover, remove "×"). Keyed by an
  optional `id`, falling back to the array index.
- **`intent` / `saliency`** apply to every chip and can be overridden per item.
- **`size`** applies to every chip and cannot be overridden per item; it also
  tunes the spacing between chips (smaller chips pack tighter).
- **`orientation`** flows the chips in a wrapping row (`horizontal`, default) or
  stacks them in a column (`vertical`).
- **`max`** caps how many chips show inline; the rest collapse behind a trailing
  "See more" chip whose `Popover` lists the remainder. Customise the chip's text
  via `seeMoreLabel` (a string, or a function of the hidden count).

The list renders as a real `<ul>` (`role="list"`) of `<li>`s (`role="listitem"`),
with the roles set explicitly so Safari keeps the list semantics under
`list-style: none`.
