---
"@saintly-software/baritone": minor
---

Add an optional **`aria-label`** to `ToggleGroupItem`, an escape hatch for
authoring a segment's accessible name when its `children` would flatten
misleadingly.

A `ToggleGroupItem` renders a `<button>` whose accessible name is derived from
its content, so rich `children` — e.g. a label paired with a trailing count
`Badge` — would announce as the concatenated text ("Comments" + "3" →
"Comments 3"). Passing `aria-label` overrides that with an authored name while
`children` stays purely visual:

```tsx
<ToggleGroupItem value="comments" aria-label="Comments">
  Comments <Badge>3</Badge>
</ToggleGroupItem>
```

Opt-in and non-breaking — omit it and the segment names itself from `children`
exactly as before. Because it replaces the whole accessible name, it should
still contain the visible label text (WCAG 2.5.3 *Label in Name*).

Internally the name rides the `InternalButton` `htmlAttrs` seam rather than
`consumerProps`: a text button's `consumerProps.aria-label` is intentionally
stripped (its name must be the visible label), whereas `htmlAttrs` merges under
the button's own props — which never set `aria-label` here — so the authored
name survives.
