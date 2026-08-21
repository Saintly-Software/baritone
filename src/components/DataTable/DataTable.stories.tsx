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
