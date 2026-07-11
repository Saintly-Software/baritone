---
"@saintly-software/baritone": minor
---

Add a `Combobox` component — a typeahead / autocomplete "form control" built on
base-ui's `Combobox`, mirroring the other form controls' `state` / `size` /
`label` / `description` / `errorMessage` API.

- **Single or multiple** selection, discriminated on `multiple`, with a
  string-based `value` / `onValueChange` (single: `string | null`; multiple:
  `string[]`). `name` submits the option `value`(s).
- **Synchronous options** (`options`) get built-in typeahead filtering.
- **Async search** via the `search` object (`{ loading, error, copy, results,
onSearch }`): internal filtering is disabled and the popup shows a spinner /
  error / empty state. `onSearch` fires with the query on each input change —
  debounce and wire up an `AbortController` in your handler.
- **`freeText`** surfaces an "Add …" row so users can commit values not in the
  list.
- **`virtualized`** windows long lists, mounting only the visible rows.
- **`hideClearButton`** hides the inline clear (✕) control.

Follows the system conventions: colours come from the shared `form` /
`surface` / `text` tokens (no hardcoded colours), variants are backed by
vanilla-extract recipes, the popup reuses `surfaceRecipe`, focus uses
`focusRingRecipe`, and disabled is modelled with `aria-disabled` + `readOnly`
so the field stays keyboard-focusable. Listbox options (never tab stops) use
base-ui's `disabled` for per-option `aria-disabled`, allowlisted in the
disabled-convention guard.
