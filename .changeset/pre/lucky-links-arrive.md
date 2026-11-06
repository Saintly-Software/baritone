---
"@saintly-software/baritone": minor
---

Add a `Link` component.

A router-agnostic inline link. Renders an `<a>` by default; pass your router's
link via the base-ui `render` prop (`render={<NextLink href="…" />}`,
`render={<RouterLink to="…" />}`, …) to integrate with any framework while
keeping the system's styling.

- **Always underlined:** the underline (not colour alone) is what signals the
  link, so it stays distinguishable for users who can't perceive the colour
  difference.
- **Primary intent colour:** locked to the `primary` text token for one
  consistent, predictable link colour across the app, with oklch-derived
  hover/active states and the shared `:focus-visible` ring.
- **Inherits typography:** picks up the surrounding font/size so it blends
  naturally into `Text`/paragraph copy.
