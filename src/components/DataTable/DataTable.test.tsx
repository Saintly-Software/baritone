import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createDataTableColumnHelper, DataTable, type DataTableProps } from "./index";

interface Person {
  id: string;
  name: string;
  role: string;
  balance: number;
}

const people: Person[] = [
  { id: "1", name: "Ada Lovelace", role: "Engineering", balance: 42 },
  { id: "2", name: "Alan Turing", role: "Research", balance: 18 },
  { id: "3", name: "Grace Hopper", role: "Compilers", balance: 96 },
];

const col = createDataTableColumnHelper<Person>();
const columns = col.columns([
  col.accessor("name", { header: "Name" }),
  col.accessor("role", { header: "Role" }),
  col.accessor("balance", {
    header: "Balance",
    meta: { align: "end" },
    cell: (info) => `$${info.getValue()}`,
  }),
]);

describe("DataTable", () => {
  it("renders a column header per column", () => {
    render(
      <DataTable aria-label="People" data={people} columns={columns} getRowId={(p) => p.id} />,
    );
    const headers = screen.getAllByRole("columnheader");
    expect(headers.map((h) => h.textContent)).toEqual(["Name", "Role", "Balance"]);
    // Header cells are real <th scope="col">.
    for (const header of headers) {
      expect(header.tagName).toBe("TH");
      expect(header).toHaveAttribute("scope", "col");
    }
  });

  it("renders one body row per datum, with cell values", () => {
    render(
      <DataTable aria-label="People" data={people} columns={columns} getRowId={(p) => p.id} />,
    );
    // Two rowgroups: thead + tbody. Body rows live in the second.
    const body = screen.getAllByRole("rowgroup")[1]!;
    expect(within(body).getAllByRole("row")).toHaveLength(3);
    expect(screen.getByRole("cell", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Compilers" })).toBeInTheDocument();
    // Custom cell renderer ran.
    expect(screen.getByRole("cell", { name: "$96" })).toBeInTheDocument();
  });

  it("names the table from a visible caption", () => {
    render(
      <DataTable caption="Team members" data={people} columns={columns} getRowId={(p) => p.id} />,
    );
    const table = screen.getByRole("table", { name: "Team members" });
    // The caption is a real <caption> element.
    expect(within(table).getByText("Team members").tagName).toBe("CAPTION");
  });

  it("names the table from aria-label instead", () => {
    render(
      <DataTable
        aria-label="People directory"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
      />,
    );
    expect(screen.getByRole("table", { name: "People directory" })).toBeInTheDocument();
    expect(screen.queryByText("People directory")).not.toBeInTheDocument();
  });

  it("applies a distinct align class to an aligned column's cells", () => {
    render(
      <DataTable aria-label="People" data={people} columns={columns} getRowId={(p) => p.id} />,
    );
    // The end-aligned Balance cell should not share the default-aligned Name cell's class.
    const nameCell = screen.getByRole("cell", { name: "Ada Lovelace" });
    const balanceCell = screen.getByRole("cell", { name: "$42" });
    expect(balanceCell.className).not.toBe(nameCell.className);
  });

  it("shows the empty slot spanning every column when there are no rows", () => {
    render(
      <DataTable
        aria-label="People"
        data={[]}
        columns={columns}
        empty="No people yet."
        getRowId={(p) => p.id}
      />,
    );
    const body = screen.getAllByRole("rowgroup")[1]!;
    expect(within(body).getAllByRole("row")).toHaveLength(1);
    const emptyCell = screen.getByRole("cell", { name: "No people yet." });
    expect(emptyCell).toHaveAttribute("colspan", "3");
  });

  it("passes className and extra table attributes through to the <table>", () => {
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        className="extra"
        data-testid="tbl"
      />,
    );
    const table = screen.getByTestId("tbl");
    expect(table.tagName).toBe("TABLE");
    expect(table.className).toContain("extra");
  });

  it("throws in dev when a visible caption is combined with an aria name", () => {
    // The `DataTableName` union already forbids this at compile time; the runtime
    // guard catches JS callers and type-casts that slip past it. Cast to simulate
    // one, and silence React's error logging for the expected throw.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const withAriaLabel = {
        caption: "People",
        "aria-label": "Team",
        data: people,
        columns,
      } as unknown as DataTableProps<Person>;
      expect(() => render(<DataTable {...withAriaLabel} />)).toThrow(/mutually exclusive/);

      const withAriaLabelledby = {
        caption: "People",
        "aria-labelledby": "h1",
        data: people,
        columns,
      } as unknown as DataTableProps<Person>;
      expect(() => render(<DataTable {...withAriaLabelledby} />)).toThrow(/mutually exclusive/);
    } finally {
      spy.mockRestore();
    }
  });
});

// A dataset whose roles repeat, so grouping actually gathers rows, plus a
// balance column that rolls up to a per-group sum.
const staff: Person[] = [
  { id: "1", name: "Ada Lovelace", role: "Engineering", balance: 42 },
  { id: "2", name: "Grace Hopper", role: "Engineering", balance: 96 },
  { id: "3", name: "Alan Turing", role: "Research", balance: 18 },
];

const groupedColumns = col.columns([
  col.accessor("name", { header: "Name" }),
  col.accessor("role", { header: "Role" }),
  col.accessor("balance", {
    header: "Balance",
    meta: { align: "end" },
    cell: (info) => `$${info.getValue()}`,
    aggregationFn: "sum",
    aggregatedCell: (info) => `$${info.getValue()}`,
  }),
]);

// A two-dimension dataset (region → role) for nested grouping: the Americas
// region holds three data rows spread across two role sub-groups.
interface Employee {
  id: string;
  region: string;
  role: string;
  name: string;
}

const employees: Employee[] = [
  { id: "1", region: "Americas", role: "Engineering", name: "Ada Lovelace" },
  { id: "2", region: "Americas", role: "Engineering", name: "Grace Hopper" },
  { id: "3", region: "Americas", role: "Sales", name: "Tom Watson" },
];

const employeeCol = createDataTableColumnHelper<Employee>();
const employeeColumns = employeeCol.columns([
  employeeCol.accessor("region", { header: "Region" }),
  employeeCol.accessor("role", { header: "Role" }),
  employeeCol.accessor("name", { header: "Name" }),
]);

describe("DataTable grouping", () => {
  it("renders a flat table (no group rows, no toggles) when grouping is omitted", () => {
    render(
      <DataTable aria-label="Staff" data={staff} columns={groupedColumns} getRowId={(p) => p.id} />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const body = screen.getAllByRole("rowgroup")[1]!;
    expect(within(body).getAllByRole("row")).toHaveLength(3);
  });

  it("inserts a collapsible header row per group, with a count and a rolled-up total", () => {
    render(
      <DataTable
        aria-label="Staff"
        data={staff}
        columns={groupedColumns}
        grouping={["role"]}
        getRowId={(p) => p.id}
      />,
    );
    // One toggle per distinct group value.
    expect(screen.getByRole("button", { name: /Engineering/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Research/ })).toBeInTheDocument();
    // The Engineering group holds two rows...
    expect(screen.getByText("(2)")).toBeInTheDocument();
    // ...and its balances sum on the group row (42 + 96 = 138).
    expect(screen.getByRole("cell", { name: "$138" })).toBeInTheDocument();
  });

  it("starts expanded: the leaf rows under each group are visible", () => {
    render(
      <DataTable
        aria-label="Staff"
        data={staff}
        columns={groupedColumns}
        grouping={["role"]}
        getRowId={(p) => p.id}
      />,
    );
    expect(screen.getByRole("cell", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Grace Hopper" })).toBeInTheDocument();
  });

  it("collapses and re-expands a group when its toggle is clicked", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        aria-label="Staff"
        data={staff}
        columns={groupedColumns}
        grouping={["role"]}
        getRowId={(p) => p.id}
      />,
    );
    // Expanded by default — a toggle labelled "Collapse …".
    const collapse = screen.getByRole("button", { name: /Collapse Engineering/ });
    expect(screen.getByRole("cell", { name: "Ada Lovelace" })).toBeInTheDocument();

    await user.click(collapse);
    // The Engineering leaves are gone; the header (now "Expand …") stays.
    expect(screen.queryByRole("cell", { name: "Ada Lovelace" })).not.toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "Grace Hopper" })).not.toBeInTheDocument();
    const expand = screen.getByRole("button", { name: /Expand Engineering/ });
    expect(expand).toHaveAttribute("aria-expanded", "false");

    await user.click(expand);
    expect(screen.getByRole("cell", { name: "Ada Lovelace" })).toBeInTheDocument();
  });

  it("starts every group collapsed with defaultExpanded={false}", () => {
    render(
      <DataTable
        aria-label="Staff"
        data={staff}
        columns={groupedColumns}
        grouping={["role"]}
        defaultExpanded={false}
        getRowId={(p) => p.id}
      />,
    );
    // Group headers are present but collapsed...
    expect(screen.getByRole("button", { name: /Expand Engineering/ })).toBeInTheDocument();
    // ...and no leaf rows show.
    expect(screen.queryByRole("cell", { name: "Ada Lovelace" })).not.toBeInTheDocument();
  });

  it("counts underlying data rows, not sub-groups, for nested grouping", () => {
    render(
      <DataTable
        aria-label="Employees"
        data={employees}
        columns={employeeColumns}
        grouping={["region", "role"]}
        getRowId={(e) => e.id}
      />,
    );
    // The Americas region holds 3 data rows across 2 role sub-groups (Engineering
    // ×2, Sales ×1). Its header must count the 3 data rows, not the 2 sub-groups —
    // so "(3)" is present, and "(2)" belongs solely to the Engineering sub-group
    // (a lone match; the buggy direct-child count would show "(2)" twice).
    expect(screen.getByText("(3)")).toBeInTheDocument();
    expect(screen.getByText("(2)")).toBeInTheDocument();
    expect(screen.getByText("(1)")).toBeInTheDocument();
  });
});
