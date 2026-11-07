---
"@saintly-software/baritone": major
---

`@base-ui/react` is now a regular dependency instead of a peer, so installing Baritone no longer requires installing base-ui alongside it. You can drop `@base-ui/react` from your app's dependencies unless you import it directly.

**Breaking:** `BaritoneProvider`'s `toastManager` prop now accepts only a `BaritoneToastManager` (from Baritone's `createToastManager()`), not a raw base-ui `ToastManager`. Create the manager with Baritone's `createToastManager()` instead of base-ui's `Toast.createToastManager()`, and pass `intent`, `saliency`, `icon`, and `actions` as top-level options to its `add` / `update` / `promise`. base-ui's `data` option is not accepted.
