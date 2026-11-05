---
"@saintly-software/baritone": minor
---

Add an imperative close escape hatch to the overlay surfaces (`Modal`,
`Popover`, `Drawer`) via a new `useOverlayHandle` hook.

Baritone's overlays stay declarative first — a `.Close` part plus controlled
`open` / `onOpenChange`. This adds the small escape hatch for the one case that
model handles awkwardly: closing after an `await` without lifting `open` into
component state.

```tsx
const modal = useOverlayHandle(Modal);
// ...
<Modal handle={modal} trigger={<Modal.Trigger>Edit</Modal.Trigger>}>
  <Modal.Footer>
    <Button
      onClick={async () => {
        await save();
        modal.close();
      }}
    >
      Save
    </Button>
  </Modal.Footer>
</Modal>;
```

- `useOverlayHandle(Modal | Popover | Drawer)` returns a stable handle;
  `handle.close()` / `handle.isOpen` control the overlay imperatively.
- Each overlay gains a `handle` prop (pass the handle here) and a matching
  `<Overlay>.createHandle` for the rare detached / module-scope case.
- Built on base-ui's native `handle` API, so `handle.close()` routes through the
  same path as every other dismissal: it fires `onOpenChange`, respects a
  controlled `open`, and is still vetoed while a `Modal` / `Drawer` is
  `disabled`. The declarative `.Close` part and controlled model are unchanged.
