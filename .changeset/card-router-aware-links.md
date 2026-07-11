---
"@saintly-software/baritone": minor
---

Add router-aware link support to a linkable `Card`.

A linkable `Card` (`href`) now also accepts `download` — a plain anchor attribute
forwarded to the card's overlay `<a>`: `download` (boolean) saves the target using
the server/URL filename, or a string sets a suggested filename. It's omitted for
`false` / unset, so an ordinary linkable card is unaffected.

- **Router integration stays via `render`.** The Card remains router-agnostic — no
  framework navigation props (`to` / `params` / `search` / `preload`) leak into the
  DS type. To wire it to your app's router, keep `href` (the resolved URL — it
  names the link and is the no-JS fallback) and pass your router's link component
  through `render`, which owns navigation while keeping the stretched-overlay
  styling. `render` already routed to the overlay link; this documents the recipe
  (JSDoc + an `AsRouterLink` story).
- **`download`** is threaded through the header's link control to the overlay `<a>`
  and only applies to the linkable mode (the clickable / static / collapsible modes
  type it as `never`).
