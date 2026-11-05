---
"@saintly-software/baritone": minor
---

Add `Lightbox` — a surface that opens an image at full size in a dialog centred
over a dimmed page.

- Opens from a **`<Lightbox.Trigger>`** (a `Button`, so all of Button's
  intents / saliencies / sizes / icons are available) passed via `trigger`.
- Dismissed by clicking the backdrop, pressing Escape, or a built-in close
  button pinned to the image's corner (`closeLabel` names it, default
  `"Close"`); clicking the image itself does not close it.
- Built on base-ui's `Dialog`, so it is modal (an always-rendered backdrop) with
  managed focus and ARIA. Its accessible name comes from `alt` (falling back to
  `"Image"`).
- Supports controlled `open` / `defaultOpen` / `onOpenChange`, the shared
  `useOverlayHandle(Lightbox)` imperative handle, and `initialFocus` /
  `finalFocus`. `className` / `ref` target the `<img>`; optional `children`
  render below the image as a caption.
