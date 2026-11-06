---
"@saintly-software/baritone": minor
---

Add `InlineList` — a horizontal run of items separated by a delimiter that wraps
when it runs out of room. The classic "byline" / metadata line
(`12 lines · 340 words · Updated 2h ago`), factored out as a reusable primitive
rather than re-implemented per card or header.

It owns only the mechanics of a separated inline flow, composing `Flex` for the
layout:

- **`separator`:** the delimiter between items — a string (default `·`), any
  node, or `null` to fall back to gap-only spacing.
- **Falsy children are dropped** (via `React.Children.toArray`), so a conditional
  item — `{isLyrics && <Text>…</Text>}` — never leaves a dangling separator when
  it's absent.
- **Separators are `aria-hidden` and non-selectable**, so assistive tech reads —
  and a copy-paste yields — just the items, never the dots. It deliberately
  avoids `ul` / `li` semantics: a metadata line is decorative separation, and
  announcing "list, N items" would be noise (reach for `List` for a genuine
  list).
- **`gap` / `align` / `wrap`:** the `Flex` layout knobs (defaults `2` / `center`
  / `true`), plus the shared `MarginProps` and `render`.

Typography is inherited, not imposed, so the separator tracks whatever text
context the list sits in; for a muted metadata line, style the items
(`<Text size="sm" saliency="low">`) and pass a matching `separator`.
