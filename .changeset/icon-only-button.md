---
"@saintly-software/baritone": minor
---

Add an icon-only variation of `Button` — a square, label-less button carrying a
single glyph — rather than a separate component (DES-37).

- Pass `icon` + `aria-label` (and no `children`) to select it, e.g.
  `<Button aria-label="Add item" icon={<Icon>…</Icon>} />`. Because there's no
  visible text to name it, `aria-label` is **required** here — the mirror of the
  labelled arms, which forbid `aria-label` since their label already is the name.
- It's a variation of the filled (`solid`) control, so `intent` / `saliency` /
  `size` / `loading` / `disabled` / `disabledReason` all behave exactly as on a
  labelled `Button`. The button stays a 1:1 square at every `size`.
- Only offered on the default look: `appearance="text"` stays label-only, since a
  bare underlined glyph reads as neither a link nor a button. `children` and
  `startIcon`/`endIcon` are unavailable on the icon-only arm (the `icon` slot is
  the whole content) — all enforced at the type level.
