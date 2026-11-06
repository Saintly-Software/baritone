---
"@saintly-software/baritone": minor
---

Add a `FileList` component.

Renders a set of files as a list of `Chip`s, stacked vertically (default) or
flowed horizontally (`orientation`).

- **Files as data:** pass `items` — an array of `FileInfo` (`{ id, file }`),
  where `id` is unique/stable and `file` is the browser `File`. The chip shows
  `file.name`, keyed by `id`.
- **File-type icon:** each chip leads with a small monochrome glyph derived from
  the `File`'s MIME type (falling back to its extension) — image, audio, video,
  pdf, spreadsheet, archive, document, or a generic file. It inherits the chip's
  colour/size and is `aria-hidden` (the filename names the entry).
- **Removable:** pass `onRemove` to give each chip a remove "×" button; it calls
  back with the file's `id`. Omit it for a read-only list.
- **Focusable when disabled:** the remove button models disabled with
  `aria-disabled` (never the native attribute), so a disabled list's buttons stay
  keyboard-reachable; clicks are suppressed.
- **Truncation:** long filenames ellipsize when the list is width-constrained.
- **Chip passthrough:** `intent` / `saliency` / `size` flow to the underlying
  chips.
