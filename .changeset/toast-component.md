---
"@saintly-software/baritone": minor
---

Add a `Toast` component and a `BaritoneProvider` that wires it up.

Toasts are fired imperatively with `useToast()` and rendered by a viewport that
`BaritoneProvider` mounts for you — there's no toast element to place inline.
Each toast's UI is a `Notice`, so it inherits the full `intent` / `saliency` /
`icon` / `title` / `description` / `actions` / dismiss surface.

- **`BaritoneProvider`** — the client-side application provider (the counterpart
  to the server-renderable, token-only `BaritoneTheme`). Wrap your app in it and
  `useToast()` works anywhere below. Takes `toastTimeout` / `toastLimit` /
  `toastManager`. The viewport portals to `<body>`, so — like every other
  overlay — it's themed via the theme class on `<body>`.
- **`useToast()`** — returns `add` / `update` / `close` / `promise` / `toasts`.
  `add({ title, description, intent, saliency, icon, actions, timeout, priority,
  id, onClose })` shows a toast and returns its id; `promise()` drives a single
  toast through loading → success/error.
- **Accessibility** — built on base-ui's `Toast`. The viewport owns the live
  region that announces toasts; each toast is a `dialog` / `alertdialog` labelled
  by its title and described by its description. The `Notice` is presentational
  so it never becomes a second live region.
- Toasts stack bottom-right as a smooth, always-expanded list (newest at the
  bottom), swipe right/down to dismiss, hover to pause the auto-dismiss timers,
  and respect `prefers-reduced-motion`.
