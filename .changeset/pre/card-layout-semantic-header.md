---
"@saintly-software/baritone": minor
---

Make `Card.Header` semantic for sectioning cards, and add `Card.Layout`.

- **`Card.Header` renders a real `<header>`** when the card root is sectioning
  content (`as="article"` / `as="section"`) or `main`, scoping the header to that
  section. A plain `div` card (and a collapsible card, whose root isn't
  sectioning) keeps a `<div>` header — a `<header>` there would instead be exposed
  as the page's `banner` landmark.
- **`Card.Layout`** — a split content row for the common "text + a trailing
  action" shapes: `title` + `subtitle` + `action`, a bare `title` + `action`, or
  (omit the `title`) `description` + `action`. It's the standalone, body-content
  sibling of a rich `Card.Row`: the same leading-text / trailing-action split, but
  a plain `<div>` rather than a `<dt>`/`<dd>` inside a `<dl>`. So a whole
  `<Card as="article">` (e.g. a teaser in a list of posts) can simply _be_ one
  row — the `title` is the article's heading and the action its content — without
  borrowing the `header` slot for content that isn't a header.
