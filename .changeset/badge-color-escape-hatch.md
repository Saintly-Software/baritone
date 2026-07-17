---
"@saintly-software/baritone": minor
---

Add `color` to `Badge` — an escape hatch that paints the badge any CSS colour,
replacing `intent` × `saliency`.

For a badge whose fill is _data_ rather than a design decision: a per-tag
colour, a customer-chosen label colour, a language/category swatch. The palette
can't enumerate those, because they aren't the system's to choose.

```tsx
<Badge text="NEW" color="#7c3aed" />
<Badge count={8} color="var(--tag-colour)" />
```

Takes anything CSS `color` does — a hex/rgb/oklch value, a custom property,
`currentColor` — and works with every content kind (`icon` / `count` / `text` /
blank) and both shapes.

**The foreground is derived, not asked for.** You supply the fill; the badge
reads its oklch lightness and snaps the text/icon to black or white, whichever
survives on it. A caller passing a brand colour shouldn't also have to work out
the readable pairing.

**Mutually exclusive with `intent`/`saliency`** (a type error, not a silent
override): the hatch replaces the token-driven scheme outright, so accepting
both would leave one doing nothing.

**Prefer `intent`/`saliency`.** Everything the palette can express should go
through it — an `intent` badge re-themes with the rest of the system, a
`color` badge is frozen at whatever you pass, and nothing checks that fill
against the surface behind it.

`BadgeProps` is now the content-kind union intersected with a colour union
(`BadgeColourProps`). Both axes are orthogonal to the content, so they
intersect the four kinds rather than multiplying them into sixteen arms.
Existing `intent`/`saliency` usage is unaffected.
