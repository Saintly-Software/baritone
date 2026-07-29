---
"@saintly-software/baritone": minor
---

Stop `Chip` button adornments from leaking their click to a clickable ancestor,
with a `forcePropagation` opt-out.

- **Button adornments now stop propagation by default** — a `Chip.Adornment`
  rendered as a `<button>` (`onClick`), plus the built-in `handleRemove` "×" and
  `contentToCopy` buttons, is its own hit target, so its click no longer bubbles
  past the chip. Wrapping a `Chip` / `ChipList` in a clickable row and removing a
  chip (or clicking any button adornment) acts on that control alone and no longer
  also fires the row's handler. This realises the existing "the label and any
  adornments are independent hit targets" design intent.
- **`Chip.Adornment` gains `forcePropagation`** (button adornments only) — set it
  to let the click bubble up to an ancestor as before. Link adornments (`href`)
  keep bubbling and don't take the prop; a disabled/inert adornment still swallows
  its click regardless.
