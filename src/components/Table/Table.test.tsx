import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Table, type TableColumn } from "./index";

// A shared fixture typed to its column-key union, so the tests read like real
// usage (inline columns infer the same union — see the "cell renderer" test).
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
    // Header cells are real <th scope="col">.
    for (const header of headers) {
      expect(header.tagName).toBe("TH");
      expect(header).toHaveAttribute("scope", "col");
    }
  });

  it("renders one body row per datum, reading each cell from the row's value at the column key", () => {
    render(<Table aria-label="People" columns={columns} rows={people} />);
    // Two rowgroups: thead + tbody. Body rows live in the second.
    const body = screen.getAllByRole("rowgroup")[1]!;
    expect(within(body).getAllByRole("row")).toHaveLength(3);
    expect(screen.getByRole("cell", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Compilers" })).toBeInTheDocument();
  });

  it("runs a column's cell renderer with the value and the whole row", () => {
    // Inline columns infer their own key union — here just `name` and `role`, so
    // the rows carry exactly those two keys.
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
    // The custom renderer combined the row's `role` value with its `name`.
    expect(screen.getByRole("cell", { name: "Engineering · Ada Lovelace" })).toBeInTheDocument();
    // The shared fixture's `balance` renderer formats its value too:
    render(<Table aria-label="P2" columns={columns} rows={people} />);
    expect(screen.getByRole("cell", { name: "$96" })).toBeInTheDocument();
  });

  it("renders a plain semantic table: thead, tbody, and <td> body cells", () => {
    render(<Table aria-label="People" columns={columns} rows={people} />);
    const table = screen.getByRole("table");
    expect(table.querySelector("thead")).not.toBeNull();
    expect(table.querySelector("tbody")).not.toBeNull();
    // Body cells are <td>, not <th>.
    const body = screen.getAllByRole("rowgroup")[1]!;
    for (const cell of within(body).getAllByRole("cell")) {
      expect(cell.tagName).toBe("TD");
    }
  });

  it("names the table from a visible caption", () => {
    render(<Table caption="Team members" columns={columns} rows={people} />);
    const table = screen.getByRole("table", { name: "Team members" });
    // The caption is a real <caption> element.
    expect(within(table).getByText("Team members").tagName).toBe("CAPTION");
  });

  it("names the table from aria-label instead", () => {
    render(<Table aria-label="People directory" columns={columns} rows={people} />);
    expect(screen.getByRole("table", { name: "People directory" })).toBeInTheDocument();
    expect(screen.queryByText("People directory")).not.toBeInTheDocument();
  });

  it("applies a distinct align class to an aligned column's cells", () => {
    render(<Table aria-label="People" columns={columns} rows={people} />);
    // The end-aligned Balance cell should not share the default-aligned Name cell's class.
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
    // A smoke test: rendering with a key deriver produces the expected rows.
    // (React keys aren't observable in the DOM, so we assert rows render one-to-one.)
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
    // Regression: the `rows` bound is `readonly object[]`, so a plain `Person[]`
    // — an interface type with no string index signature — is accepted.
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
    // Two columns reading the same field is valid (e.g. shown two ways).
    // Cells are keyed by column position, so React never warns of duplicate keys.
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
      // Both columns rendered the same field.
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
    // A visible caption plus aria-label/aria-labelledby names the table twice
    // (the aria value wins for AT) — so it's rejected in dev.
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
