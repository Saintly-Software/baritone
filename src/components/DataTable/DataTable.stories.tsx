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

// Kept at module scope so references stay stable (a fresh array each render
// would throw away TanStack's row model). Roles repeat for the grouping stories.
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
  // `meta.align` is DataTable's house column option (a type-only v9 meta slot).
  // `aggregationFn`/`aggregatedCell` roll up group rows — inert until grouping is on.
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
 * Group rows by a column with `grouping`: each distinct value gets a
 * collapsible header row with its label, row count, and per-group total.
 * Groups start expanded.
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

// Category → Subcategory breakdown for the merged presentation: `category` and
// each `subcategory` leaf share one indented column, with a summed `amount`.
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
  // The host column: `header` names the merged outline; cells carry the group
  // value (header rows) and each subcategory (leaf rows).
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
 * `groupDisplay="merge"` renders the grouping as one indented outline column:
 * `category`'s value, toggle, and count sit in the first visible column, and
 * each `subcategory` leaf renders one level in. `amount` still rolls up per group.
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
 * Give each row an expandable detail panel with `renderDetailPanel`: a leading
 * chevron opens a full-width panel rendered from that row's datum. Panels
 * start collapsed, toggle independently, and only render while open.
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
 * Gate which rows can expand with `enableRowExpansion`, a predicate mirroring
 * `enableRowSelection`. Only rows over $1,000 are expandable here.
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
 * Row selection, controlled by id: `enableRowSelection` adds the checkbox
 * column; `selectedRowIds` + `onSelectionChange` own the state. The header box
 * selects/clears all (indeterminate on partial); shift-click extends the range.
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
 * Uncontrolled selection: seed with `defaultSelectedRowIds` and let the table
 * own the state; `onSelectionChange` still reports the selected ids and rows.
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
 * A predicate gates which rows are selectable — here, only rows over $1,000.
 * Non-selectable rows show a locked, focusable (`aria-disabled`) box, and
 * "select all" skips them.
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
 * Selection composes with grouping: each group header carries a tri-state box
 * that selects/clears its rows and reflects all/some/none selected.
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
