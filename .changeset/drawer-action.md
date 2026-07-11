---
"@saintly-software/baritone": minor
---

Add `Drawer.Action` — a menu-style action row for a drawer's header, footer, or
inline action lists (DES-49).

- Borrows `Menu.Item`'s look and its button/link semantics: renders a real
  `<button>` for `onClick`, or an `<a>`/router link for `href`/`render` (via
  `InternalGenericButtonAnchor`), with a leading `icon` (`ReactNode`) and an
  `intent` (`neutral` / `secondary` / `warning` / `negative`).
- Unlike `Menu.Item`, it needs no menu context: it's an ordinary tab stop in the
  drawer's focus order (keyboard reachable with Tab), with its highlight wash
  driven by `:hover`/`:focus-visible` and keyboard focus drawn by the shared
  focus ring.
- `disabled` follows the house rule — `aria-disabled` (stays focusable), never
  the native attribute, with activation swallowed. Wrap in `<Drawer.Close>` if an
  action should also close the drawer.
