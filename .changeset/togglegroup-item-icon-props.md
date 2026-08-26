---
"@saintly-software/baritone": minor
---

Give `ToggleGroupItem` `Button`'s first-class icon vocabulary — **`startIcon`**,
**`endIcon`**, and an icon-only **`icon`** arm — so a segment no longer has to
hand-compose icons into `children`.

`ToggleGroup` already renders every segment through the same `InternalButton`
that powers `Button`, so the layout — the icon/label gap and vertical alignment —
was already owned there; these props just thread through to it. Consumers stop
re-implementing that spacing per call:

```tsx
// before — manual composition, the caller owns alignment
<ToggleGroupItem value="rhyme">
  <Icon style={{ verticalAlign: "middle", marginInlineEnd: "0.35em" }}><Music /></Icon>
  Rhyme scheme
</ToggleGroupItem>

// after — declarative, baritone owns layout
<ToggleGroupItem value="rhyme" startIcon={<Icon><Music /></Icon>}>
  Rhyme scheme
</ToggleGroupItem>
```

The props mirror `Button` exactly and are discriminated on `icon`:

- **`startIcon` / `endIcon`** — icons flanking the visible label on a labelled
  segment. Mutually exclusive with `icon`.
- **`icon`** — the icon-only arm: a single centred glyph replaces the label and
  the button is squared to a 1:1 box, exactly like an icon-only `Button`. Because
  there's no visible text, **`aria-label` becomes required** (and `children` /
  `startIcon` / `endIcon` are unavailable), so an icon-only segment can never be
  unnamed. `icon` is typed `NonNullable<React.ReactNode>` so a nullish value
  can't slip through the arm and drop the required name.

Additive and non-breaking: existing `children`-only segments are unchanged, and a
labelled segment's optional `aria-label` override still behaves as before (it
rides the `InternalButton` `htmlAttrs` seam; the icon-only arm's required
`aria-label` rides `consumerProps`, which is where `InternalButton` forwards an
icon-only button's name).
