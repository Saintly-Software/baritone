---
"@saintly-software/baritone": minor
---

Add `minWidth` to `Flex` — `min-width` from the atoms sizing scale
(responsive-capable), matching the `maxWidth` / `minHeight` knobs already on the
container.

Closes an asymmetry: `Flex.Item` has taken `minWidth` since it shipped, and
`Flex` itself already took `maxWidth` and `minHeight` — `minWidth` was the one
missing corner, so a `Flex` needing it had to drop to `atoms` or `className`.

```tsx
<Flex direction="column" minWidth="16" gap="2">
  …
</Flex>
```

The most common use is `minWidth="0"`, which lets a nested flex container
actually shrink below its content's intrinsic width (so long text can truncate
instead of overflowing its parent).
