---
"@saintly-software/baritone": minor
---

Move `DataTable` to its own entry point — import it from
`@saintly-software/baritone/datatable` instead of the package root.

**Breaking (for `DataTable` consumers):** `DataTable`, `dataTableFeatures`,
`createDataTableColumnHelper`, and the DataTable types are no longer re-exported
from `@saintly-software/baritone`. Update imports:

```diff
-import { DataTable, createDataTableColumnHelper } from "@saintly-software/baritone";
+import { DataTable, createDataTableColumnHelper } from "@saintly-software/baritone/datatable";
```

Nothing else moves — every other component still imports from the package root,
and styles remain a single `@saintly-software/baritone/styles.css`.

**Why:** `@tanstack/react-table` is a peer dependency, but the build was bundling
it into the main entry rather than leaving it external like the other peers. That
pulled its CJS `require("react")` interop into the ESM output, which throws in a
pure-ESM consumer (`Calling require for "react" in an environment that doesn't
expose the require function`) — even for consumers that never touch `DataTable`.
The table engine is now (a) left external, so consumers resolve their own copy,
and (b) reachable only through the `/datatable` subpath, so importing anything
else from the package never references it.
