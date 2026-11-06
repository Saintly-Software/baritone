---
"@saintly-software/baritone": minor
---

Add an `SrOnly` utility component — visually-hidden text that stays in the
accessibility tree.

Use it to expose content to screen readers that is redundant or purely visual
for sighted users: an accessible name for an icon-only control, extra context on
a terse link (`Read more<SrOnly> about pricing</SrOnly>`), or a polite live
region for status announcements.

The content is hidden with the standard clip/rect technique — collapsed to a
1×1px, clipped, out-of-flow sliver — deliberately **not** `display: none` or
`visibility: hidden`, both of which would drop the node from the a11y tree.
Renders a `<span>` by default; retarget it with the base-ui `render` prop.
