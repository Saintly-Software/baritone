---
"@saintly-software/baritone": minor
---

Add `width` to `Drawer` — the panel's width, on a five-step scale.

- **`width`** — `xs` (14rem / 224px), `sm` (26rem / 416px), `md` (default,
  38rem / 608px), `lg` (52rem / 832px), or `xl` (64rem / 1024px). Every step
  keeps the existing viewport cap, so a wide drawer shrinks to fit on narrow
  screens rather than overflowing.

**Visual change:** the panel was previously a fixed 22rem (352px). The new `md`
default is 38rem (608px), so drawers that don't pass `width` get noticeably
wider. Pass `width="sm"` (26rem / 416px) for the closest step to the old width.
