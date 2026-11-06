---
"@saintly-software/baritone": minor
---

Add a `HelpText` component — a single inline help / validation line (icon + text)
for use under a form control or standalone. It composes the `Text` and `Icon`
primitives, so the glyph inherits the line's resolved colour and scales with the
type size.

- **Colour** via `intent` + `saliency` (default `neutral` / `mid`), plus two
  convenience flags for the common form states: `invalid` → `negative` and
  `disabled` → a dimmed `neutral` (`disabled` wins over `invalid`).
- **Auto glyph** — a warning triangle shows automatically on the attention
  intents (`warning` / `negative`, incl. `invalid`) when no `icon` is passed;
  supply your own `icon`, or `hideIcon` to drop it. The icon is decorative
  (`aria-hidden`) since the message carries the meaning.
- **`variant`** (`xs` | `sm` | `md` | `lg`, default `sm`) scales the message and
  icon together; **`render`** for polymorphism (defaults to a `<p>`).
