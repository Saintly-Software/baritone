---
"@saintly-software/baritone": minor
---

Add `createToastManager()` for firing toasts from outside React.

`useToast()` only works inside a component. Code that runs at module scope — a
fetch interceptor, a store, a TanStack Query `MutationCache`'s `onError` — had no
way to reach the toast viewport, so consumers fell back to base-ui's raw
`Toast.createToastManager` and hand-packed the design-system fields into its
`data` bag themselves (duplicating what `useToast().add` does internally).

- **`createToastManager()`** — returns a `BaritoneToastManager` with the same
  `add` / `update` / `close` / `promise` surface as `useToast()`, taking the
  design-system fields (`intent` / `saliency` / `icon` / `actions`) at the top
  level and packing them for you. Create one at module scope, hand it to
  `<BaritoneProvider toastManager={…}>` to connect it to the viewport, then fire
  toasts from anywhere:

  ```ts
  // toast.ts — no component needed
  export const toasts = createToastManager();
  toasts.add({ title: "Couldn't save", intent: "negative", priority: "high" });
  ```

- `BaritoneProvider`'s `toastManager` prop is now typed `BaritoneToastManager`
  (was base-ui's raw `ToastManager`).
- Note: a module-scope manager holds no reactive toast list, so its `update`
  replaces the toast's visual `data` wholesale rather than merging over the live
  toast — pass every visual field you want kept. `useToast().update` still merges.
