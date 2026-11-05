---
"@saintly-software/baritone": minor
---

Add a `Modal` component.

A "surface" element type shown in a panel centred over the page. Its API mirrors
`Drawer` — it composes `header` / `footer` props (or `<Modal.Header>` /
`<Modal.Footer>` children) around its content and takes the same `intent` /
`saliency` / `padding` surface knobs (via `surfaceRecipe`). Built on base-ui's
`Dialog`, so ARIA wiring and focus management are handled for you.

- **Trigger:** `trigger` accepts a `<Modal.Trigger>`, which renders a `Button`
  (all of Button's intents / saliencies / sizes / icons apply) wired with the
  right `aria-haspopup` / `aria-expanded`.
- **Header labels the modal:** `<Modal.Header>` renders its `title` / `subtitle`
  through base-ui's `Dialog.Title` / `Dialog.Description`, so they become the
  modal's accessible name and description.
- **Close from inside:** `<Modal.Close>` renders a `Button` that dismisses the
  modal — drop it in a `<Modal.Footer>` for actions.
- **Size:** `size` sets the panel's max width — `sm`, `md` (default), or `lg`.
- **Loading state:** `loading` overlays a spinner on the body content (the header
  and footer stay live so the modal can still be closed) and marks the panel
  `aria-busy`.
- **Disabled state:** `disabled` makes the modal non-dismissable — Escape and the
  close button are both vetoed while a blocking action is in flight.
- **Modal with an always-on backdrop:** the backdrop is force-rendered (even for
  nested modals), the page behind is inert, and clicking outside never closes the
  modal.
