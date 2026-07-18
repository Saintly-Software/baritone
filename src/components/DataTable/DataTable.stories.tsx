import type { Meta, StoryObj } from "@storybook/react-vite";
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
const people: Person[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com", role: "Engineering", balance: 4200 },
  { id: "2", name: "Alan Turing", email: "alan@example.com", role: "Research", balance: 1875 },
  { id: "3", name: "Grace Hopper", email: "grace@example.com", role: "Compilers", balance: 9600 },
  { id: "4", name: "Katherine Johnson", email: "kj@example.com", role: "Trajectory", balance: 320 },
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
  col.accessor("balance", {
    header: "Balance",
    meta: { align: "end" },
    cell: (info) => usd.format(info.getValue()),
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
