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
  col.accessor("email", {
    header: "Email",
    cell: (info) => <Link href={`mailto:${info.getValue()}`}>{info.getValue()}</Link>,
  }),
  col.accessor("role", { header: "Role" }),
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

export const Basic: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <DataTable caption="Team members" data={people} columns={columns} getRowId={(p) => p.id} />
    </div>
  ),
};

export const AriaLabelled: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <DataTable aria-label="Team members" data={people} columns={columns} getRowId={(p) => p.id} />
    </div>
  ),
};

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
  expenseCol.accessor("subcategory", { header: "Category" }),
  expenseCol.accessor("category", { header: "Category" }),
  expenseCol.accessor("amount", {
    header: "Amount",
    meta: { align: "end" },
    cell: (info) => usd.format(info.getValue()),
    aggregationFn: "sum",
    aggregatedCell: (info) => usd.format(info.getValue()),
  }),
]);

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
