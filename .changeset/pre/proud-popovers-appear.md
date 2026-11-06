---
"@saintly-software/baritone": minor
---

Add a `Popover` component.

A "surface" element type shown in a floating layer, anchored to a trigger. Its
API mirrors `Card` — it composes `header` / `footer` props (or
`<Popover.Header>` / `<Popover.Footer>` children) around its content and takes
the same `intent` / `saliency` / `padding` surface knobs (via `surfaceRecipe`).
Built on base-ui's `Popover`, so ARIA wiring, focus management, and dismissal
are handled for you.

- **Trigger:** `trigger` accepts a `<Popover.Trigger>`, which renders a `Button`
  (all of Button's intents / saliencies / sizes / icons apply) wired with the
  right `aria-haspopup` / `aria-expanded`.
- **Header labels the popover:** `<Popover.Header>` renders its `title` /
  `subtitle` through base-ui's `Popover.Title` / `Popover.Description`, so they
  become the popover's accessible name and description.
- **Close from inside:** `<Popover.Close>` renders a `Button` that dismisses the
  popover — drop it in a `<Popover.Footer>` for actions.
- **Non-modal by default:** clicking outside or pressing `Escape` closes the
  popover while the rest of the page stays interactive; pass `modal` to lock
  scroll and trap focus.
- **Positioning:** `side` / `align` / `sideOffset` place it against the trigger
  (base-ui defaults: `bottom` / `center`, with an `8`px offset here).

This is the consumer-facing disclosure pattern the system pointed `InternalTooltip`
/ `InaccessibleTooltip` toward; it is now exported.
