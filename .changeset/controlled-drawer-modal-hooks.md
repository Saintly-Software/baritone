---
"@saintly-software/baritone": minor
---

Add `useControlledDrawer` and `useControlledModal` — hooks for driving an
overlay's open state from the parent.

Each hook owns the open state and returns a spreadable props bundle
(`drawerProps` / `modalProps`, i.e. `{ open, onOpenChange }`) alongside
`isOpen` / `open()` / `close()` / `toggle()` / `setOpen()`. Reach for them when
an overlay must be opened or closed from outside its trigger — from a menu item,
or after an `await`.

```tsx
const drawer = useControlledDrawer();
// ...
<button onClick={drawer.open}>Open</button>
<Drawer {...drawer.drawerProps}>…</Drawer>;
// drawer.close() from an async handler; drawer.isOpen to read state
```

- `setOpen` is `onOpenChange`-compatible, so the surface's own dismissals
  (Escape, close button) flow back into `isOpen`.
- State-only by design: `useOverlayHandle` remains the separate tool for closing
  an overlay without lifting `open` into state. The declarative `.Close` part
  and controlled `open` / `onOpenChange` model are unchanged.
