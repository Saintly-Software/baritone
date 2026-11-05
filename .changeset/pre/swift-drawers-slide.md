---
"@saintly-software/baritone": minor
---

Add a `Drawer` component.

A "surface" element type shown in a panel that slides in from the edge of the
screen. Its API mirrors `Popover` — it composes `header` / `footer` props (or
`<Drawer.Header>` / `<Drawer.Footer>` children) around its content and takes the
same `intent` / `saliency` / `padding` surface knobs (via `surfaceRecipe`).
Built on base-ui's `Drawer`, so ARIA wiring, focus management, and
swipe-to-dismiss are handled for you.

- **Trigger:** `trigger` accepts a `<Drawer.Trigger>`, which renders a `Button`
  (all of Button's intents / saliencies / sizes / icons apply) wired with the
  right `aria-haspopup` / `aria-expanded`.
- **Header labels the drawer:** `<Drawer.Header>` renders its `title` /
  `subtitle` through base-ui's `Drawer.Title` / `Drawer.Description`, so they
  become the drawer's accessible name and description.
- **Close from inside:** `<Drawer.Close>` renders a `Button` that dismisses the
  drawer — drop it in a `<Drawer.Footer>` for actions.
- **Side:** `side` slides the panel in from the `right` (default) or `left`; the
  swipe-to-dismiss gesture follows it.
- **Loading state:** `loading` overlays a spinner on the body content (the header
  and footer stay live so the drawer can still be closed) and marks the panel
  `aria-busy`.
- **Disabled state:** `disabled` makes the drawer non-dismissable — Escape, the
  close button, and swipe are all vetoed while a blocking action is in flight.
- **Modal with an always-on backdrop:** the backdrop is force-rendered (even for
  nested drawers), the page behind is inert, and clicking outside never closes
  the drawer.
