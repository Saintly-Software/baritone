---
"@saintly-software/baritone": minor
---

Add `orientation` (and a `width` fill knob) to `ToggleGroup`, so it can render as
a vertical segmented control instead of only a single-line toolbar. Additive and
non-breaking — both default to today's behaviour.

- **`orientation`** — `"horizontal"` (default, the toolbar) or `"vertical"` (a
  stacked column). It drives _both_ halves at once:
  - **Paint** comes from the recipe (a variant on the group's own class), not a
    consumer `className` override: `vertical` lays the segments out in a column
    and stretches them (`align-items: stretch`) so they share one width down the
    stack instead of each hugging its own label. The `gap` token is unchanged.
  - **Keyboard** is wired to match by passing the same orientation through to
    base-ui's `ToggleGroup` roving focus, so Up/Down move between segments in a
    vertical group and Left/Right in a horizontal one (selection stays manual —
    Enter/Space). This fixes the old `className`-override workaround, which
    silently desynced the _visual_ direction from the _keyboard_ direction (in a
    column, Left/Right still moved focus and Up/Down didn't).

  The group is `role="group"`, which — unlike `toolbar` / `radiogroup` — has no
  `aria-orientation`, so none is emitted; the axis is conveyed by the roving-focus
  keys and base-ui's `data-orientation`.

- **`width`** — the same `fill` / `fit` / `inherit` shorthand `Box` / `Flex` /
  `Button` take. The group is `inline-flex` and a labelled group double
  shrink-wraps (the `Field` wrapper is `fit: "content"` too), so a vertical group
  in a fixed-width sidebar couldn't be made to fill from props. `width="fill"`
  spans the container _and_ flips the wrapping `Field` to `fit: "fill"` so the
  fill isn't swallowed by the shrink-wrapped field. Omit it and the group keeps
  its natural shrink-to-content size, exactly as before.

```tsx
<ToggleGroup
  aria-label="Annotation tool"
  orientation="vertical"
  width="fill"
  value={tool}
  onChange={setTool}
>
  {({ ToggleGroupItem }) => (
    <>
      <ToggleGroupItem value="select">Select</ToggleGroupItem>
      <ToggleGroupItem value="draw">Draw</ToggleGroupItem>
      <ToggleGroupItem value="erase">Erase</ToggleGroupItem>
    </>
  )}
</ToggleGroup>
```

Form-control mode (a labelled group) lays out correctly in a column under every
`labelPosition` (`top` / `start` / `end`), with `helpText` and the `invalid`
state under the control as before.
