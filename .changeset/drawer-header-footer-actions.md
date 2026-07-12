---
"@saintly-software/baritone": minor
---

Rework `Drawer`'s action affordances and drop the surface `intent` prop.

**Breaking:** the `Drawer.Action` subcomponent and its `DrawerActionProps` type
have been removed, along with `Drawer`'s surface `intent` prop. In their place,
actions now live on the header and footer slots directly:

- `<Drawer.Header actions={…} actionsLabel="…">` renders an overflow `Menu`
  behind an icon-only "more options" trigger at the header's end. Each entry is a
  `Menu.Item`'s props (falsy entries are skipped). `actionsLabel` names the
  trigger (default `"Actions"`). Use this for secondary, per-item actions.
- `<Drawer.Footer actions={…}>` renders the primary button row as a joined
  `ButtonGroup` at the footer's end. Each entry is a `ButtonGroup.Item` element.
- The surface always renders `surfaceRecipe`'s default neutral shade — matching
  `Popover`/`Modal`, `Drawer` no longer accepts `intent` (only `saliency` /
  `padding`).

Migration: replace stacked `<Drawer.Action>` rows with the header `actions`
(overflow menu) and/or footer `actions` (button row) props, and drop any `intent`
passed to `<Drawer>` itself.
