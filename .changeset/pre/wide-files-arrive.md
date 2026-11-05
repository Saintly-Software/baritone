---
"@saintly-software/baritone": minor
---

Add a `FileUpload` component.

A "form control" element type for staging file(s) for upload: a dashed dropzone
that opens the system file picker on click and accepts drag-and-drop. Staged
files render below as a removable `FileList`. Built on base-ui's `Field` for
label association and `invalid` → `aria-invalid` wiring, like `TextInput`.

- **Discriminated union on `multiple`:** `value` / `onChange` are kept in lockstep
  — `multiple` ⇒ `FileInfo[]` (new selections/drops append), otherwise a lone
  `FileInfo | null` (a new pick replaces it). A mismatched pair is a compile error.
- **Native drag-and-drop, no new dependency:** uses the HTML5 DnD API. A
  transparent file `<input>` overlays the zone to own clicks + keyboard, while
  drops are intercepted on the zone so they can be filtered against
  `acceptedFileTypes` (the native `accept` only constrains the picker).
- **`acceptedFileTypes`:** a `string[]` in the HTML `accept` grammar — extensions
  (`.pdf`), wildcard MIME (`image/*`), or exact MIME (`application/pdf`); enforced
  on both the picker and the drop path.
- **`invalid` / `required`:** negative accent + `aria-invalid`, and
  `required` / `aria-required` on the input.
- **`disabled`:** dims the dropzone and vetoes the picker/drops, but the input
  stays keyboard-focusable (`aria-disabled`, never the native attribute — a file
  input ignores `readOnly`, so the picker is blocked by cancelling the click) and
  staged chips stay focusable-but-inert.
- **`helpText`:** supplementary guidance shown beneath the dropzone, wired to the
  input as its accessible description (`aria-describedby`).
- **Labelling:** a visible `label`, or `aria-label` / `aria-labelledby` for an
  external label.
