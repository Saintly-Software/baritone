---
"@saintly-software/baritone": minor
---

Add `width` to `Button` and `Link` — the same `fill` / `fit` / `inherit`
shorthand `Box` and `Flex` already take.

A button is `inline-flex` and hugs its label, so the full-width form submit and
the mobile CTA — both routine — had to reach past the prop API for a
`className` or a stretching wrapper. `WidthShorthand` already existed; it just
wasn't wired in here.

```tsx
<Button width="fill">Save changes</Button>
<Link appearance="button" href="/signup" width="fill">Get started</Link>
```

The label stays centred (the recipe's own `justify-content`).

**Where it isn't offered**, because the box couldn't honour it:

- **Icon-only `Button`** (`icon` + `aria-label`) — the square treatment pins a
  1:1 `aspect-ratio`, so `fill` wouldn't widen the button, it would inflate it
  into a container-sized square.
- **`appearance="text"`** — the underline spans the element's full width, so a
  filled text button drags its underline across the whole row with the label
  stranded at one end.

Both reject `width` at the type level rather than rendering something broken.
