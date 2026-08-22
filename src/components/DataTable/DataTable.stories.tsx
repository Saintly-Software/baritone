import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Link } from "../Link";
import { createDataTableColumnHelper, DataTable } from "./index";

interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
  balance: number;
}

// Kept at module scope so the references stay stable across renders — a fresh
// `data`/`columns` array every render would throw away TanStack's row model.
// Roles repeat so the grouping stories have something to gather.
const people: Person[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com", role: "Engineering", balance: 4200 },
  { id: "2", name: "Grace Hopper", email: "grace@example.com", role: "Engineering", balance: 9600 },
  {
    id: "3",
    name: "Barbara Liskov",
    email: "barbara@example.com",
    role: "Engineering",
    balance: 2750,
  },
  { id: "4", name: "Alan Turing", email: "alan@example.com", role: "Research", balance: 1875 },
  { id: "5", name: "Katherine Johnson", email: "kj@example.com", role: "Research", balance: 320 },
  {
    id: "6",
    name: "Edsger Dijkstra",
    email: "edsger@example.com",
    role: "Research",
    balance: 5100,
  },
];

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const col = createDataTableColumnHelper<Person>();
const columns = col.columns([
  col.accessor("name", { header: "Name" }),
  // A custom cell renderer — any React node, here a real `Link`.
  col.accessor("email", {
    header: "Email",
    cell: (info) => <Link href={`mailto:${info.getValue()}`}>{info.getValue()}</Link>,
  }),
  col.accessor("role", { header: "Role" }),
  // `meta.align` is DataTable's house column option (a v9 type-only meta slot).
  // `aggregationFn` + `aggregatedCell` roll the column up on group-header rows —
  // inert until a story turns grouping on.
  col.accessor("balance", {
    header: "Balance",
    meta: { align: "end" },
    cell: (info) => usd.format(info.getValue()),
    aggregationFn: "sum",
    aggregatedCell: (info) => usd.format(info.getValue()),
  }),
]);

const meta: Meta<typeof DataTable<Person>> = {
  title: "Components/DataTable",
  component: DataTable,
};
export default meta;

type Story = StoryObj<typeof DataTable<Person>>;

/** The columns and rows you pass, rendered as a semantic, named `<table>`. */
export const Basic: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <DataTable caption="Team members" data={people} columns={columns} getRowId={(p) => p.id} />
    </div>
  ),
};

/** Name the table without a visible caption via `aria-label`. */
export const AriaLabelled: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <DataTable aria-label="Team members" data={people} columns={columns} getRowId={(p) => p.id} />
    </div>
  ),
};

/** With no rows, the `empty` slot spans every column. */
export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <DataTable
        caption="Team members"
        data={[]}
        columns={columns}
        empty="No people yet."
        getRowId={(p) => p.id}
      />
    </div>
  ),
};

/**
 * Group rows by a column with `grouping`. Each distinct value gets a collapsible
 * header row showing the group's label, its row count, and the balance column's
 * per-group total (from its `aggregationFn`). Groups start expanded; click a
 * chevron to collapse one.
 */
export const Grouped: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <DataTable
        caption="Team members by department"
        data={people}
        columns={columns}
        grouping={["role"]}
        getRowId={(p) => p.id}
      />
    </div>
  ),
};

/** The same grouping, but every group starts collapsed via `defaultExpanded={false}`. */
export const GroupedCollapsed: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <DataTable
        caption="Team members by department"
        data={people}
        columns={columns}
        grouping={["role"]}
        defaultExpanded={false}
        getRowId={(p) => p.id}
      />
    </div>
  ),
};

// A Category → Subcategory breakdown for the merged presentation: the grouped
// `category` reads down the same indented column as each `subcategory` leaf, with
// a summed `amount` alongside. Kept at module scope for a stable reference.
interface Expense {
  id: string;
  category: string;
  subcategory: string;
  amount: number;
}

const expenses: Expense[] = [
  { id: "1", category: "Housing", subcategory: "Rent", amount: 1800 },
  { id: "2", category: "Housing", subcategory: "Utilities", amount: 240 },
  { id: "3", category: "Housing", subcategory: "Insurance", amount: 120 },
  { id: "4", category: "Food", subcategory: "Groceries", amount: 520 },
  { id: "5", category: "Food", subcategory: "Dining out", amount: 180 },
  { id: "6", category: "Transport", subcategory: "Fuel", amount: 160 },
  { id: "7", category: "Transport", subcategory: "Transit pass", amount: 95 },
];

const expenseCol = createDataTableColumnHelper<Expense>();
const expenseColumns = expenseCol.columns([
  // The host column: its `header` names the merged outline, and its cells carry
  // both the group value (on header rows) and each subcategory (on leaf rows).
  expenseCol.accessor("subcategory", { header: "Category" }),
  // Grouped away in `groupDisplay="merge"` — its value moves into the host column.
  expenseCol.accessor("category", { header: "Category" }),
  expenseCol.accessor("amount", {
    header: "Amount",
    meta: { align: "end" },
    cell: (info) => usd.format(info.getValue()),
    aggregationFn: "sum",
    aggregatedCell: (info) => usd.format(info.getValue()),
  }),
]);

/**
 * `groupDisplay="merge"` renders the grouping as one indented outline column: the
 * grouped `category` isn't a column of its own — its value, toggle, and count sit
 * in the first visible column, and each `subcategory` leaf renders in that same
 * column one level in. The summed `amount` still rolls up per group.
 */
export const GroupedMerged: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <DataTable
        caption="Spending by category"
        data={expenses}
        columns={expenseColumns}
        grouping={["category"]}
        groupDisplay="merge"
        getRowId={(e) => e.id}
      />
    </div>
  ),
};

/**
 * Give each row an expandable detail panel with `renderDetailPanel`. A leading
 * chevron opens a full-width panel beneath the row, rendered from that row's
 * datum (here a small profile). Panels start collapsed and toggle independently;
 * the function runs only for open rows.
 */
export const WithDetailPanel: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <DataTable
        caption="Team members"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        renderDetailPanel={(person) => (
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "4px 16px",
              margin: 0,
            }}
          >
            <dt style={{ fontWeight: 600 }}>Email</dt>
            <dd style={{ margin: 0 }}>
              <Link href={`mailto:${person.email}`}>{person.email}</Link>
            </dd>
            <dt style={{ fontWeight: 600 }}>Role</dt>
            <dd style={{ margin: 0 }}>{person.role}</dd>
            <dt style={{ fontWeight: 600 }}>Balance</dt>
            <dd style={{ margin: 0 }}>{usd.format(person.balance)}</dd>
          </dl>
        )}
      />
    </div>
  ),
};

/**
 * Gate which rows can expand with `enableRowExpansion` — a predicate mirroring
 * `enableRowSelection`. Here only rows with a balance over $1,000 are expandable;
 * the rest (Katherine, at $320) show no chevron at all.
 */
export const WithDetailPanelSome: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <DataTable
        caption="Team members (only rows over $1,000 expandable)"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        enableRowExpansion={(person) => person.balance > 1000}
        renderDetailPanel={(person) => (
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "4px 16px",
              margin: 0,
            }}
          >
            <dt style={{ fontWeight: 600 }}>Email</dt>
            <dd style={{ margin: 0 }}>
              <Link href={`mailto:${person.email}`}>{person.email}</Link>
            </dd>
            <dt style={{ fontWeight: 600 }}>Role</dt>
            <dd style={{ margin: 0 }}>{person.role}</dd>
          </dl>
        )}
      />
    </div>
  ),
};

/**
 * Row selection, controlled by id. `enableRowSelection` adds the leading checkbox
 * column; `selectedRowIds` + `onSelectionChange` own the state. The header box
 * selects all / clears all and goes indeterminate on a partial selection.
 * Shift-click a second row to select the range between it and the last one.
 */
export const Selectable: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<string[]>(["2"]);
    return (
      <div style={{ maxWidth: 640, display: "grid", gap: 12 }}>
        <DataTable
          caption="Team members"
          data={people}
          columns={columns}
          getRowId={(p) => p.id}
          enableRowSelection
          selectedRowIds={selected}
          onSelectionChange={setSelected}
        />
        <p style={{ margin: 0 }}>
          Selected: {selected.length === 0 ? "none" : selected.join(", ")}
        </p>
      </div>
    );
  },
};

/**
 * Uncontrolled selection: seed it with `defaultSelectedRowIds` and let the table
 * own the state, observing changes through `onSelectionChange` (which still hands
 * back the selected ids and their rows).
 */
export const SelectableUncontrolled: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <DataTable
        caption="Team members"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        enableRowSelection
        defaultSelectedRowIds={["1", "3"]}
        onSelectionChange={(ids) => console.log("selected:", ids)}
      />
    </div>
  ),
};

/**
 * A predicate gates which rows are selectable — here, only rows with a balance
 * over $1,000. Non-selectable rows (Katherine, at $320) show a locked (dimmed,
 * `aria-disabled`) box that stays focusable, and "select all" skips them.
 */
export const SelectableSome: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<string[]>([]);
    return (
      <div style={{ maxWidth: 640 }}>
        <DataTable
          caption="Team members (only rows over $1,000 selectable)"
          data={people}
          columns={columns}
          getRowId={(p) => p.id}
          enableRowSelection={(person) => person.balance > 1000}
          selectedRowIds={selected}
          onSelectionChange={setSelected}
        />
      </div>
    );
  },
};

/**
 * Selection composes with grouping: each group header carries a tri-state box that
 * selects or clears all of its rows at once, and reflects whether all, some, or
 * none of them are selected.
 */
export const GroupedSelectable: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<string[]>([]);
    return (
      <div style={{ maxWidth: 640 }}>
        <DataTable
          caption="Team members by department"
          data={people}
          columns={columns}
          grouping={["role"]}
          getRowId={(p) => p.id}
          enableRowSelection
          selectedRowIds={selected}
          onSelectionChange={setSelected}
        />
      </div>
    );
  },
};
