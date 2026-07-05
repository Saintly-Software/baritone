---
"@saintly-software/baritone": minor
---

Add a `CardList` component — renders a set of `Card`s as a semantic vertical
list.

- **Real list semantics:** a `<ul>` (`role="list"`) with each child card wrapped
  in its own `<li>` (`role="listitem"` — set explicitly so Safari keeps the list
  role under `list-style: none`), so it's announced as a list with one item per
  card.
- **`gap`:** spacing between cards, from the spacing scale. Default `4`.
- **Required accessible name:** pass `aria-label` **or** `aria-labelledby` — a
  union type makes providing neither a compile error.
