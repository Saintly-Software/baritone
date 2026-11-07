import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Table, type TableColumn } from "./index";

const columns: TableColumn<"name" | "role" | "balance">[] = [
  { key: "name", header: "Name" },
  { key: "role", header: "Role" },
  { key: "balance", header: "Balance", align: "end", cell: (value) => `$${value}` },
];

const people = [
  { name: "Ada Lovelace", role: "Engineering", balance: 42 },
  { name: "Alan Turing", role: "Research", balance: 18 },
  { name: "Grace Hopper", role: "Compilers", balance: 96 },
];

describe("Table", () => {
  it("renders a column header per column", () => {
    render(<Table aria-label="People" columns={columns} rows={people} />);
    const headers = screen.getAllByRole("columnheader");
    expect(headers.map((h) => h.textContent)).toEqual(["Name", "Role", "Balance"]);
    for (const header of headers) {
      expect(header.tagName).toBe("TH");
      expect(header).toHaveAttribute("scope", "col");
    }
  });

  it("renders one body row per datum, reading each cell from the row's value at the column key", () => {
    render(<Table aria-label="People" columns={columns} rows={people} />);
    const body = screen.getAllByRole("rowgroup")[1]!;
    expect(within(body).getAllByRole("row")).toHaveLength(3);
    expect(screen.getByRole("cell", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Compilers" })).toBeInTheDocument();
  });

  it("runs a column's cell renderer with the value and the whole row", () => {
    render(
      <Table
        aria-label="People"
        columns={[
          { key: "name", header: "Name" },
          { key: "role", header: "Role", cell: (value, row) => `${value} · ${row.name}` },
        ]}
        rows={[{ name: "Ada Lovelace", role: "Engineering" }]}
      />,
    );
    expect(screen.getByRole("cell", { name: "Engineering · Ada Lovelace" })).toBeInTheDocument();
    render(<Table aria-label="P2" columns={columns} rows={people} />);
    expect(screen.getByRole("cell", { name: "$96" })).toBeInTheDocument();
  });

  it("renders a plain semantic table: thead, tbody, and <td> body cells", () => {
    render(<Table aria-label="People" columns={columns} rows={people} />);
    const table = screen.getByRole("table");
    expect(table.querySelector("thead")).not.toBeNull();
    expect(table.querySelector("tbody")).not.toBeNull();
    const body = screen.getAllByRole("rowgroup")[1]!;
    for (const cell of within(body).getAllByRole("cell")) {
      expect(cell.tagName).toBe("TD");
    }
  });

  it("names the table from a visible caption", () => {
    render(<Table caption="Team members" columns={columns} rows={people} />);
    const table = screen.getByRole("table", { name: "Team members" });
    expect(within(table).getByText("Team members").tagName).toBe("CAPTION");
  });

  it("names the table from aria-label instead", () => {
    render(<Table aria-label="People directory" columns={columns} rows={people} />);
    expect(screen.getByRole("table", { name: "People directory" })).toBeInTheDocument();
    expect(screen.queryByText("People directory")).not.toBeInTheDocument();
  });

  it("applies a distinct align class to an aligned column's cells", () => {
    render(<Table aria-label="People" columns={columns} rows={people} />);
    const nameCell = screen.getByRole("cell", { name: "Ada Lovelace" });
    const balanceCell = screen.getByRole("cell", { name: "$42" });
    expect(balanceCell.className).not.toBe(nameCell.className);
  });

  it("renders just the header and an empty body when there are no rows", () => {
    render(<Table aria-label="People" columns={columns} rows={[]} />);
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    const body = screen.getAllByRole("rowgroup")[1]!;
    expect(within(body).queryAllByRole("row")).toHaveLength(0);
  });

  it("keys rows with getRowKey when provided", () => {
    render(
      <Table
        aria-label="People"
        columns={columns}
        rows={people}
        getRowKey={(row) => String(row.name)}
      />,
    );
    const body = screen.getAllByRole("rowgroup")[1]!;
    expect(within(body).getAllByRole("row")).toHaveLength(3);
  });

  it("passes className and extra table attributes through to the <table>", () => {
    render(
      <Table
        aria-label="People"
        columns={columns}
        rows={people}
        className="extra"
        data-testid="tbl"
      />,
    );
    const table = screen.getByTestId("tbl");
    expect(table.tagName).toBe("TABLE");
    expect(table.className).toContain("extra");
  });

  it("renders a typed interface-backed row array (no implicit index signature)", () => {
    interface Person {
      name: string;
      role: string;
    }
    const staff: Person[] = [
      { name: "Ada Lovelace", role: "Engineering" },
      { name: "Alan Turing", role: "Research" },
    ];
    render(
      <Table
        aria-label="Staff"
        columns={[
          { key: "name", header: "Name" },
          { key: "role", header: "Role" },
        ]}
        rows={staff}
      />,
    );
    expect(screen.getByRole("cell", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Research" })).toBeInTheDocument();
  });

  it("renders duplicate column keys without a React key warning", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      render(
        <Table
          aria-label="People"
          columns={[
            { key: "name", header: "Name" },
            { key: "name", header: "Name (again)" },
          ]}
          rows={[{ name: "Ada Lovelace" }]}
        />,
      );
      expect(screen.getAllByRole("columnheader")).toHaveLength(2);
      expect(screen.getAllByRole("cell", { name: "Ada Lovelace" })).toHaveLength(2);
      const keyWarnings = spy.mock.calls.filter((args) =>
        args.some((a) => typeof a === "string" && a.includes('unique "key"')),
      );
      expect(keyWarnings).toHaveLength(0);
    } finally {
      spy.mockRestore();
    }
  });

  it("throws in dev when a visible caption is combined with an aria name", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() =>
        render(<Table caption="People" aria-label="Team" columns={columns} rows={people} />),
      ).toThrow(/mutually exclusive/);
      expect(() =>
        render(<Table caption="People" aria-labelledby="h1" columns={columns} rows={people} />),
      ).toThrow(/mutually exclusive/);
    } finally {
      spy.mockRestore();
    }
  });
});
