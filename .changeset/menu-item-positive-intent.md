---
"@saintly-software/baritone": minor
---

Add `positive` to `Menu.Item`'s `intent` — a menu row can now read as
confirming/constructive (Publish, Approve, Restore), the counterpart to the
`negative` row that was already there.

```tsx
<Menu
  trigger={<Menu.Trigger>Actions</Menu.Trigger>}
  items={[
    <Menu.Item key="publish" intent="positive" onClick={publish}>
      Publish
    </Menu.Item>,
    <Menu.Item key="delete" intent="negative" onClick={remove}>
      Delete
    </Menu.Item>,
  ]}
/>
```

`MenuItemIntent` is now `neutral | secondary | warning | negative | positive`.
It's a widening, so no existing usage changes.

`primary` remains excluded, and now says why in the source: it's the
call-to-action colour, and a row in a list of peers isn't a CTA — a
primary-coloured row would out-shout the menu's own trigger.
