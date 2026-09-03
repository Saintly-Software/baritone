import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "../Link";
import { Table } from "./index";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const meta: Meta<typeof Table> = {
  title: "Components/Table",
  component: Table,
};
export default meta;

type Story = StoryObj<typeof Table>;

/**
 * Columns and rows rendered as a plain, semantic `<table>`. The columns' `key`s
 * are the contract — TypeScript rejects a row that omits or adds one.
 */
export const Basic: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Table
        caption="Team members"
        columns={[
          { key: "name", header: "Name" },
          { key: "role", header: "Role" },
          { key: "balance", header: "Balance", align: "end" },
        ]}
        rows={[
          { name: "Ada Lovelace", role: "Engineering", balance: "$4,200" },
          { name: "Alan Turing", role: "Research", balance: "$1,875" },
          { name: "Grace Hopper", role: "Compilers", balance: "$9,600" },
        ]}
      />
    </div>
  ),
};

/**
 * A column's `cell` renderer receives the row's value and the whole row, so it
 * can wrap the value in any element — here a `Link` and a currency-formatted number.
 */
export const CustomCells: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Table
        caption="Team members"
        columns={[
          { key: "name", header: "Name" },
          {
            key: "email",
            header: "Email",
            cell: (value) => <Link href={`mailto:${value}`}>{value}</Link>,
          },
          {
            key: "balance",
            header: "Balance",
            align: "end",
            cell: (value) => usd.format(Number(value)),
          },
        ]}
        rows={[
          { name: "Ada Lovelace", email: "ada@example.com", balance: 4200 },
          { name: "Alan Turing", email: "alan@example.com", balance: 1875 },
          { name: "Grace Hopper", email: "grace@example.com", balance: 9600 },
        ]}
      />
    </div>
  ),
};

/** Name the table without a visible caption via `aria-label`. */
export const AriaLabelled: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Table
        aria-label="Team members"
        columns={[
          { key: "name", header: "Name" },
          { key: "role", header: "Role" },
        ]}
        rows={[
          { name: "Ada Lovelace", role: "Engineering" },
          { name: "Alan Turing", role: "Research" },
        ]}
      />
    </div>
  ),
};

/** With no rows, the header shows and the body is empty. */
export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Table
        caption="Team members"
        columns={[
          { key: "name", header: "Name" },
          { key: "role", header: "Role" },
        ]}
        rows={[]}
      />
    </div>
  ),
};
