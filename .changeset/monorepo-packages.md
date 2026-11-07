---
"@saintly-software/baritone": major
"@saintly-software/baritone-datatable": major
"@saintly-software/baritone-form": major
---

The TanStack integrations moved out of the core into their own packages, so the `@saintly-software/baritone/datatable` and `@saintly-software/baritone/form` subpaths are gone.

**Breaking:** install the package for the integration you use and update its imports. The packages version in lockstep with the core.

- `@saintly-software/baritone/datatable` → `@saintly-software/baritone-datatable`. Also import `@saintly-software/baritone-datatable/styles.css` next to the core stylesheet; DataTable's styles are no longer in `@saintly-software/baritone/styles.css`.
- `@saintly-software/baritone/form` → `@saintly-software/baritone-form`.
