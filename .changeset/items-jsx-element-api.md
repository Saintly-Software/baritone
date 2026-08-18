---
"@saintly-software/baritone": minor
---

Standardise collection APIs on JSX `items`: `Menu`, `List`, and `ChipList` now
take an `items` array of `<X.Item>` **elements** rather than prop objects,
matching `ButtonGroup`. This unifies what `items` means across the library — an
array of `<Component.Item>` elements — and lets rows read as ordinary JSX.

**Breaking — `Menu`:**

```tsx
// Before
<Menu trigger={…} items={[{ children: "Edit", onClick: edit }]} />
// After
<Menu trigger={…} items={[<Menu.Item key="edit" onClick={edit}>Edit</Menu.Item>]} />
```

**Breaking — `ChipList`:** items are now `<ChipList.Item>` elements (a new
carrier part, like `ButtonGroup.Item`), and the item-props type `ChipListItem`
is renamed `ChipListItemProps`.

```tsx
// Before
<ChipList items={[{ children: "React" }, { children: "Vite" }]} />
// After
<ChipList items={[
  <ChipList.Item key="react">React</ChipList.Item>,
  <ChipList.Item key="vite">Vite</ChipList.Item>,
]} />
```

**Breaking — `List`:** the object-array `items` and the `children`-composition
path are both replaced by a single `items` array of `<List.Item>` elements.

```tsx
// Before (either form)
<List items={[{ id: "a", children: "Ada" }]} />
<List><List.Item>Ada</List.Item></List>
// After
<List items={[<List.Item key="a">Ada</List.Item>]} />
```

All three share one rule (a `keyedElements` helper): falsy entries (`null` /
`false` / `undefined`) are skipped — so a row can be included conditionally
inline (`canDelete && <Menu.Item …>Delete</Menu.Item>`) — and each surviving row
keeps its own `key`, falling back to its _original_ index (stable when a
conditional entry toggles).

`Tabs` and `Accordion` intentionally keep their object-array `items`/`tabs`:
they infer a generic `value` union across the entries to type-check
`value`/`onChange`/`initialValue`, and that inference does not survive JSX
elements (whose props widen to `any`).
