---
"@saintly-software/baritone": major
---

Redesign the `Card` header API and make its padding responsive.

**Breaking changes:**

- **`padding` prop removed** (and the `CardPadding` type): a card's internal
  padding is no longer configurable. It's now **responsive** — the `4` spacing
  token up to the `md` breakpoint (768px) and `6` beyond — driven through the same
  `--surfacePadding` the surface reads, so `Card.Bleed` / `Card.Divider` stay in
  sync at every width.

**New — string-`header` shorthand (replaces `Card.Layout`):**

- **`header` as a string:** renders a styled header title (a `Heading`) instead
  of raw text. An interactive (`onClick` / `href`) or `collapsible` card still
  turns that title into its overlay control.
- **`subheader`:** a tight caption shown beneath a string `header`, in the header
  block.
- **`description`:** a supporting body paragraph, rendered beneath the header and
  above any `children` (works with any header).
- **`action`:** a trailing control (e.g. a `<Button>`) at the end of a string
  `header`'s row.
- **`level`:** document-outline level for a string `header`'s title (default `3`).
- **`children` is optional**, so `header` + `description` / `action` alone make a
  complete card.

**Deprecated:**

- **`Card.Layout`** is now `@deprecated` (still functional). Prefer the
  string-`header` shorthand, which covers the same title / subtitle / action
  shapes without a wrapping element and also wires up an interactive card's
  overlay link.
