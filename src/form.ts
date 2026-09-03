// The TanStack Form integration ships from its own entry point —
// `@saintly-software/baritone/form`, not the main barrel — so importing
// anything else never pulls in `@tanstack/react-form` (a peer dep), same as
// `DataTable`/`@tanstack/react-table`.
export * from "./components/Form";
