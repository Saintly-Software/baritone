// `DataTable` ships from its own entry point (`@saintly-software/baritone/datatable`)
// rather than the main barrel, so only code that imports this subpath pulls in
// `@tanstack/react-table` (a peer dependency) — the main entry stays free of it.
export {
  DataTable,
  dataTableFeatures,
  createDataTableColumnHelper,
  type DataTableProps,
  type DataTableBaseProps,
  type DataTableName,
  type DataTableColumn,
  type DataTableColumnMeta,
  type DataTableFeatures,
} from "./components/DataTable";
