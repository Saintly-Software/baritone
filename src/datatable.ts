// `DataTable` ships from its own entry point — `@saintly-software/baritone/datatable`
// — rather than the main barrel, so importing anything else from the package never
// pulls in `@tanstack/react-table`. Only code that reaches for this subpath resolves
// the table engine (a peer dependency); the main entry stays free of it.
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
