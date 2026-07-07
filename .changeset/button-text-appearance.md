---
"@saintly-software/baritone": minor
---

Add a hyperlink-style `appearance="text"` to `Button`.

`ButtonProps` is now discriminated on `appearance`: the default filled control
(`"solid"`) or the new text look (`"text"`). A `<Button appearance="text">`
drops the component chrome (background, border, control height, padding) and
renders as underlined text coloured by the `text.color` tokens — reading like a
`Link` but staying a real `<button>` driven by `intent`/`saliency`.

- **Typography via `variant`:** the text appearance takes a body typography size
  (`xs`–`xl`) via `variant` in place of `size`, which is typed away.
- **No spinner:** `loading` is unsupported (typed `never`) — there's no chrome to
  overlay a spinner on — and is ignored even if forced through at runtime.
- **No icon-only mode:** an unlabelled underlined glyph reads as neither link nor
  button, so `icon` + `aria-label` stay unavailable (`aria-label` is already
  `never`).
- **Unchanged behaviour:** `disabled` (via `aria-disabled`, keyboard-reachable),
  `disabledReason` tooltips, `onClick`, and `startIcon`/`endIcon` all work as they
  do on the default appearance. Hover/active derive from the resolved colour with
  the same oklch relative-colour math; disabled dims to the shared control opacity
  since `text.color` has no disabled shade.
