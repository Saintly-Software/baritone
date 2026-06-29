---
"@saintly-software/baritone": minor
---

Add `icon` and `chip` props to `Accordion.ItemHeader`, mirroring `Card.Header`.

- **`icon`** — a leading glyph (typically an `<Icon>`) before the title/subtitle
  stack.
- **`chip`** — a trailing element (typically a status `<Chip>`) after the title,
  sitting just inside the disclosure chevron.

Both render inside the item's trigger `<button>`, so keep them decorative — the
title remains the trigger's accessible name. Headers with neither prop are
unchanged.
