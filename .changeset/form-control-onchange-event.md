---
"@saintly-software/baritone": major
---

Give every form control the same change-callback shape: **the plain value comes
first, the raw event comes last.** Previously the value-first controls dropped
the event entirely, and `TextInput` did the opposite — it forwarded the native
event only. Now they agree.

- `Checkbox`, `Switch`, `RadioGroup`, `CheckboxGroup`, `Select`, `ToggleGroup`
  call `onChange(value, event)`, and `Combobox` calls `onValueChange(value, event)`.
  The second argument is base-ui's raw DOM `Event` (from its `eventDetails.event`)
  — for `Select`, the clear button forwards its click's `nativeEvent`.
- **`TextInput` is the breaking one.** Its `onChange` no longer forwards the
  native React event by itself — it is now `onChange(value: string, event)`, where
  `event` is the raw `React.ChangeEvent`. Read the text from the **first**
  argument; `event.target.value` still works but the value arg is the point.
- `FileUpload`'s event is optional: `onChange(value, event?)`. A picker `change`
  or a drag-and-drop passes the raw `React` event (`FileUploadChangeEvent`, newly
  exported); removing a staged file passes no event (`undefined`).

Migration:

```tsx
// TextInput — before
<TextInput value={v} onChange={(e) => setV(e.target.value)} />
// TextInput — after
<TextInput value={v} onChange={(value) => setV(value)} />
// (or simply onChange={setV})
```

Callbacks that only use the value — `onChange={setValue}` and friends — need no
change; the extra argument is additive for them.
