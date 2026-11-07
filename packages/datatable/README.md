# @saintly-software/baritone-datatable

`DataTable` for the [Baritone](https://github.com/Saintly-Software/baritone/tree/main/packages/baritone) design system: a
[TanStack Table](https://tanstack.com/table) instance rendered as a semantic,
Baritone-styled `<table>`, with grouping, row selection and detail panels.

```sh
pnpm add @saintly-software/baritone-datatable @saintly-software/baritone @tanstack/react-table
```

Import its stylesheet once, next to Baritone's:

```tsx
import "@saintly-software/baritone/styles.css";
import "@saintly-software/baritone-datatable/styles.css";
import { DataTable, createDataTableColumnHelper } from "@saintly-software/baritone-datatable";
```
