// The TanStack Form integration ships from its own entry point —
// `@saintly-software/baritone/form` — rather than the main barrel, so importing
// anything else from the package never pulls in `@tanstack/react-form`. Only code
// that reaches for this subpath resolves the form engine (a peer dependency); the
// main entry stays free of it, exactly like `DataTable` and `@tanstack/react-table`.
export * from "./components/Form";
