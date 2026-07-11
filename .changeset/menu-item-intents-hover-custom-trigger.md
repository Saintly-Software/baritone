---
"@saintly-software/baritone": minor
---

Round out the `Menu` component (`Menu` / `Menu.Item` / `Menu.Trigger`).

Builds on the initial `Menu` with the rest of the DES-69 API:

- **`Menu.Item` gains the `secondary` intent** alongside `neutral`/`warning`/
  `negative`, so a row can carry the same accent as a `secondary` `Chip`/`Button`.
- **`keepOpen` on a row** holds the menu open after it activates (via base-ui's
  `closeOnClick`), for a repeatable, non-navigating action like a stepper. Rows
  still dismiss on click by default.
- **`items` accepts falsy entries** (`null` / `false` / `undefined`), which are
  filtered out — so a row can be included conditionally inline
  (`canDelete && { children: "Delete", … }`) without a wrapper.
- **`Menu.Trigger` gains `openOnHover`** (plus `delay` / `closeDelay`) to open
  the menu on pointer hover, not just click/keyboard.
- **`Menu.Trigger` accepts a base-ui `render`** for a fully custom, non-Button
  trigger (an avatar, an icon-only control) that still receives the popup wiring
  — the house `render` polymorphism convention, never `asChild`.

`disabled` / `loading` on the trigger were already covered by `Menu.Trigger`'s
`Button` props. Keyboard navigation, type-ahead, and focus return to the trigger
on close come from base-ui and now have explicit test coverage.
