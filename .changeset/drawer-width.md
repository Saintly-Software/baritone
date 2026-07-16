---
"@saintly-software/baritone": minor
---

Add `width` to `Drawer` — the panel's width, on a five-step scale.

- **`width`** — `xs` (15rem), `sm` (18rem), `md` (default, 22rem), `lg` (28rem),
  or `xl` (36rem). Every step keeps the existing viewport cap, so a wide drawer
  shrinks to fit on narrow screens rather than overflowing.

The `md` default matches the width the panel was previously hardcoded to, so
drawers that don't pass `width` render exactly as before.
