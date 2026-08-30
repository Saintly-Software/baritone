---
"@saintly-software/baritone": minor
---

Make every `icon` slot accept a **bare glyph**, so a caller no longer hand-wraps
each one in `<Icon>`:

```tsx
// before — wrap every glyph yourself
<Menu.Item icon={<Icon><PenLine /></Icon>}>Edit</Menu.Item>

// after — pass the glyph; the slot wraps it
<Menu.Item icon={<PenLine />}>Edit</Menu.Item>
```

A new shared `renderIcon` primitive backs every icon slot and resolves three
forms, discriminated at runtime:

- **A bare glyph** (`icon={<PenLine />}`) is auto-wrapped in a colour-inheriting
  `<Icon>`.
- **An explicit `<Icon>`** (`icon={<Icon size="lg" label="Edit"><PenLine /></Icon>}`)
  passes straight through — its own props win — so the old spelling still works
  and stays the escape hatch for sizing/labelling a glyph.
- **A render function** `(props, state) => element`, mirroring base-ui's `render`
  signature, for full control. It receives the host's chrome props to spread and
  the host's resolved icon **state** to branch on — whichever of
  `intent` / `saliency` / `size` / `loading` / `disabled` that component computes:

  ```tsx
  <Button
    startIcon={(props, state) => <Save {...props} strokeWidth={state.size === "lg" ? 2 : 1.5} />}
  >
    Save
  </Button>
  ```

Adopted across every consumer-facing icon slot — `Button` (`startIcon` /
`endIcon` / `icon`), `Menu.Item`, `Chip` (`icon` / `trailIcon` / `Chip.Adornment`),
`ToggleGroup`, `ToggleButton`, `Link`, `Notice` (leading icon and `Notice.Action`),
`Toast`, `Badge`, `Card`, `MetricCard`, `Accordion`, `ConfirmationModal`,
`Combobox`, `InfoButton`, `Tabs`, `HelpText`, and `Lockup`.

Additive and non-breaking: the slot types widen from `React.ReactNode` to
`ReactNode | ((props, state) => ReactElement)`, so existing `<Icon>` and
conditional (`cond ? <Icon/> : null`) usage is unchanged. `size` is exposed in a
render function's `state` but is **not** newly applied to the default wrap, so
bare glyphs render exactly as before; the two hosts that already sized their icon
(`HelpText`, `Lockup`) keep doing so. `Switch` is unchanged — its thumb sizes the
`svg` directly, so bare glyphs already worked there.
