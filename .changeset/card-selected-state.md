---
"@saintly-software/baritone": minor
---

Add a `selected` state to `Card`.

A new optional `selected` boolean marks a card as chosen — for a card holding a
checked `Checkbox`, or one picked in a multi-select grid. It accents the surface
edge (the hairline border is recoloured to the primary focus colour and an inset
ring thickens it to a deliberate ~2px outline), with a `forced-colors` fallback
to the system `Highlight`.

The accessibility follows the semantics of each card mode, so the state is never
conveyed by colour alone:

- **Static card** (the default): `selected` is _visual_. A plain container can't
  validly carry `aria-selected`/`aria-pressed`, so the real selected control
  inside — e.g. the checked `Checkbox` — is what conveys state to assistive tech;
  the accent reinforces it for sighted users.
- **Clickable card** (`onClick`): the overlay title button becomes a toggle,
  gaining `aria-pressed={selected}` — so the whole surface is an announced
  selection target. A plain clickable card (no `selected`) stays an ordinary
  button.
- **Linkable card** (`href`): the overlay title link marks itself the current
  choice with `aria-current` when selected (and nothing when not).
