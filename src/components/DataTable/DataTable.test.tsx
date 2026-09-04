import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
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
    for (const header of headers) {
      expect(header.tagName).toBe("TH");
      expect(header).toHaveAttribute("scope", "col");
    }
  });

  it("renders one body row per datum, with cell values", () => {
    render(
      <DataTable aria-label="People" data={people} columns={columns} getRowId={(p) => p.id} />,
    );
    const body = screen.getAllByRole("rowgroup")[1]!;
    expect(within(body).getAllByRole("row")).toHaveLength(3);
    expect(screen.getByRole("cell", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Compilers" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "$96" })).toBeInTheDocument();
  });

  it("names the table from a visible caption", () => {
    render(
      <DataTable caption="Team members" data={people} columns={columns} getRowId={(p) => p.id} />,
    );
    const table = screen.getByRole("table", { name: "Team members" });
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
    expect(screen.getByRole("button", { name: /Engineering/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Research/ })).toBeInTheDocument();
    expect(screen.getByText("(2)")).toBeInTheDocument();
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
    const collapse = screen.getByRole("button", { name: /Collapse Engineering/ });
    expect(screen.getByRole("cell", { name: "Ada Lovelace" })).toBeInTheDocument();

    await user.click(collapse);
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
    expect(screen.getByRole("button", { name: /Expand Engineering/ })).toBeInTheDocument();
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
    expect(screen.getByText("(3)")).toBeInTheDocument();
    expect(screen.getByText("(2)")).toBeInTheDocument();
    expect(screen.getByText("(1)")).toBeInTheDocument();
  });

  it("keeps the grouped column (default groupDisplay='columns') — a regression guard", () => {
    const { container: implicit } = render(
      <DataTable
        aria-label="Staff"
        data={staff}
        columns={groupedColumns}
        grouping={["role"]}
        getRowId={(p) => p.id}
      />,
    );
    expect(
      within(implicit)
        .getAllByRole("columnheader")
        .map((h) => h.textContent),
    ).toEqual(["Name", "Role", "Balance"]);

    const { container: explicit } = render(
      <DataTable
        aria-label="Staff"
        data={staff}
        columns={groupedColumns}
        grouping={["role"]}
        groupDisplay="columns"
        getRowId={(p) => p.id}
      />,
    );
    expect(explicit.querySelector("table")!.outerHTML).toBe(
      implicit.querySelector("table")!.outerHTML,
    );
  });
});

function labelDepth(el: HTMLElement): number {
  const match = (el.getAttribute("style") ?? "").match(/:\s*(\d+)/);
  return match ? Number(match[1]) : Number.NaN;
}

describe("DataTable grouping — groupDisplay='merge'", () => {
  it("drops the grouped column and hosts the label in the first visible column", () => {
    render(
      <DataTable
        aria-label="Staff"
        data={staff}
        columns={groupedColumns}
        grouping={["role"]}
        groupDisplay="merge"
        getRowId={(p) => p.id}
      />,
    );
    expect(screen.getAllByRole("columnheader").map((h) => h.textContent)).toEqual([
      "Name",
      "Balance",
    ]);
  });

  it("shows the group value + count and per-group aggregate on a group-header row", () => {
    render(
      <DataTable
        aria-label="Staff"
        data={staff}
        columns={groupedColumns}
        grouping={["role"]}
        groupDisplay="merge"
        getRowId={(p) => p.id}
      />,
    );
    const toggle = screen.getByRole("button", { name: /Engineering/ });
    const headerRow = toggle.closest("tr")!;
    expect(within(headerRow).getByText("Engineering")).toBeInTheDocument();
    expect(within(headerRow).getByText("(2)")).toBeInTheDocument();
    expect(within(headerRow).getByRole("cell", { name: "$138" })).toBeInTheDocument();
  });

  it("renders each leaf's own value in the host column, indented by depth", () => {
    render(
      <DataTable
        aria-label="Staff"
        data={staff}
        columns={groupedColumns}
        grouping={["role"]}
        groupDisplay="merge"
        getRowId={(p) => p.id}
      />,
    );
    const leaf = screen.getByText("Ada Lovelace");
    expect(leaf.closest("td")).toBeInTheDocument();
    const groupLabel = screen.getByRole("button", { name: /Engineering/ }).parentElement!;
    expect(labelDepth(leaf)).toBeGreaterThan(labelDepth(groupLabel));
  });

  it("collapses and re-expands a group in merge mode", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        aria-label="Staff"
        data={staff}
        columns={groupedColumns}
        grouping={["role"]}
        groupDisplay="merge"
        getRowId={(p) => p.id}
      />,
    );
    const collapse = screen.getByRole("button", { name: /Collapse Engineering/ });
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();

    await user.click(collapse);
    expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
    const expand = screen.getByRole("button", { name: /Expand Engineering/ });
    expect(expand).toHaveAttribute("aria-expanded", "false");

    await user.click(expand);
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("indents progressively across multi-level grouping", () => {
    render(
      <DataTable
        aria-label="Employees"
        data={employees}
        columns={employeeColumns}
        grouping={["region", "role"]}
        groupDisplay="merge"
        getRowId={(e) => e.id}
      />,
    );
    expect(screen.getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Name"]);

    const region = screen.getByRole("button", { name: /Americas/ }).parentElement!;
    const role = screen.getByRole("button", { name: /Engineering/ }).parentElement!;
    const leaf = screen.getByText("Ada Lovelace");
    expect(labelDepth(region)).toBeLessThan(labelDepth(role));
    expect(labelDepth(role)).toBeLessThan(labelDepth(leaf));
  });

  it("still shows the empty slot spanning the reduced column set", () => {
    render(
      <DataTable
        aria-label="Staff"
        data={[]}
        columns={groupedColumns}
        grouping={["role"]}
        groupDisplay="merge"
        empty="No staff yet."
        getRowId={(p) => p.id}
      />,
    );
    expect(screen.getByRole("cell", { name: "No staff yet." })).toHaveAttribute("colspan", "2");
  });

  it("renders like the columns mode when grouping is absent (merge is inert)", () => {
    const { container: merged } = render(
      <DataTable
        aria-label="Staff"
        data={staff}
        columns={groupedColumns}
        groupDisplay="merge"
        getRowId={(p) => p.id}
      />,
    );
    const { container: plain } = render(
      <DataTable aria-label="Staff" data={staff} columns={groupedColumns} getRowId={(p) => p.id} />,
    );
    expect(merged.querySelector("table")!.outerHTML).toBe(plain.querySelector("table")!.outerHTML);
  });

  it("honours meta.groupLabel to pick the host column", () => {
    const hostBalance = col.columns([
      col.accessor("name", { header: "Name" }),
      col.accessor("role", { header: "Role" }),
      col.accessor("balance", {
        header: "Balance",
        meta: { align: "end", groupLabel: true },
        cell: (info) => `$${info.getValue()}`,
        aggregationFn: "sum",
      }),
    ]);
    render(
      <DataTable
        aria-label="Staff"
        data={staff}
        columns={hostBalance}
        grouping={["role"]}
        groupDisplay="merge"
        getRowId={(p) => p.id}
      />,
    );
    const headerRow = screen.getByRole("button", { name: /Engineering/ }).closest("tr")!;
    const cells = within(headerRow).getAllByRole("cell");
    expect(within(cells[1]!).getByText("Engineering")).toBeInTheDocument();
    expect(cells[0]!.textContent).toBe("");
  });

  it("keeps the aggregate: the default host skips an aggregated column", () => {
    interface Line {
      id: string;
      category: string;
      amount: number;
    }
    const lines: Line[] = [
      { id: "1", category: "Housing", amount: 100 },
      { id: "2", category: "Housing", amount: 40 },
      { id: "3", category: "Food", amount: 25 },
    ];
    const lineCol = createDataTableColumnHelper<Line>();
    const lineColumns = lineCol.columns([
      lineCol.accessor("category", { header: "Category" }),
      lineCol.accessor("amount", {
        header: "Amount",
        meta: { align: "end" },
        cell: (info) => `$${info.getValue()}`,
        aggregationFn: "sum",
        aggregatedCell: (info) => `$${info.getValue()}`,
      }),
    ]);
    render(
      <DataTable
        aria-label="Lines"
        data={lines}
        columns={lineColumns}
        grouping={["category"]}
        groupDisplay="merge"
        getRowId={(l) => l.id}
      />,
    );
    expect(screen.getAllByRole("columnheader").map((h) => h.textContent)).toEqual([
      "Category",
      "Amount",
    ]);
    const headerRow = screen.getByRole("button", { name: /Housing/ }).closest("tr")!;
    expect(within(headerRow).getByText("Housing")).toBeInTheDocument();
    expect(within(headerRow).getByRole("cell", { name: "$140" })).toBeInTheDocument();
  });

  it("still renders a usable host when every column is grouped", () => {
    interface Pair {
      id: string;
      category: string;
      subcategory: string;
    }
    const pairs: Pair[] = [
      { id: "1", category: "Housing", subcategory: "Rent" },
      { id: "2", category: "Housing", subcategory: "Utilities" },
      { id: "3", category: "Food", subcategory: "Groceries" },
    ];
    const pairCol = createDataTableColumnHelper<Pair>();
    const pairColumns = pairCol.columns([
      pairCol.accessor("category", { header: "Category" }),
      pairCol.accessor("subcategory", { header: "Subcategory" }),
    ]);
    render(
      <DataTable
        aria-label="Pairs"
        data={pairs}
        columns={pairColumns}
        grouping={["category", "subcategory"]}
        groupDisplay="merge"
        getRowId={(p) => p.id}
      />,
    );
    expect(screen.getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Subcategory"]);
    const housing = screen.getByRole("button", { name: /Housing/ });
    const housingRow = housing.closest("tr")!;
    expect(within(housingRow).getAllByRole("cell").length).toBeGreaterThan(0);
    expect(within(housingRow).getByText("(2)")).toBeInTheDocument();
  });
});

/** The checkbox inside the body row that renders the given cell text. */
function rowCheckbox(name: string): HTMLInputElement {
  const row = screen.getByText(name).closest("tr");
  if (!row) throw new Error(`No row for ${name}`);
  return within(row).getByRole("checkbox");
}

/** A controlled selectable table that surfaces its selection for assertions. */
function ControlledSelection({ initial = [] }: { initial?: string[] }) {
  const [selected, setSelected] = React.useState<string[]>(initial);
  return (
    <>
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        enableRowSelection
        selectedRowIds={selected}
        onSelectionChange={setSelected}
      />
      <output data-testid="selection">{[...selected].sort().join(",")}</output>
    </>
  );
}

describe("DataTable row selection", () => {
  it("renders no checkbox column unless selection is enabled", () => {
    render(
      <DataTable aria-label="People" data={people} columns={columns} getRowId={(p) => p.id} />,
    );
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("adds a select-all header box and one box per row when enabled", () => {
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        enableRowSelection
      />,
    );
    expect(screen.getByRole("checkbox", { name: "Select all rows" })).toBeInTheDocument();
    for (const person of people) {
      expect(screen.getByRole("checkbox", { name: `Select ${person.name}` })).toBeInTheDocument();
    }
  });

  it("names a row from its first usable cell, skipping a leading empty/display cell", () => {
    const withLeadingDisplay = col.columns([
      col.display({ id: "spacer", header: "" }),
      col.accessor("name", { header: "Name" }),
    ]);
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={withLeadingDisplay}
        getRowId={(p) => p.id}
        enableRowSelection
      />,
    );
    expect(screen.getByRole("checkbox", { name: "Select Ada Lovelace" })).toBeInTheDocument();
  });

  it("reports the selected ids and their rows through onSelectionChange", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        enableRowSelection
        onSelectionChange={onSelectionChange}
      />,
    );
    await user.click(rowCheckbox("Ada Lovelace"));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["1"], [people[0]]);
    expect(rowCheckbox("Ada Lovelace")).toBeChecked();
  });

  it("select-all toggles every selectable row", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        enableRowSelection
        onSelectionChange={onSelectionChange}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    const [ids] = onSelectionChange.mock.calls.at(-1)!;
    expect([...ids].sort()).toEqual(["1", "2", "3"]);
  });

  it("shows the mixed state on the header box for a partial selection", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        enableRowSelection
      />,
    );
    await user.click(rowCheckbox("Ada Lovelace"));
    const selectAll = screen.getByRole("checkbox", { name: "Select all rows" });
    expect(selectAll).toBePartiallyChecked();
    expect(selectAll).not.toBeChecked();
  });

  it("seeds the initial selection from defaultSelectedRowIds (uncontrolled)", () => {
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        enableRowSelection
        defaultSelectedRowIds={["2"]}
      />,
    );
    expect(rowCheckbox("Alan Turing")).toBeChecked();
    expect(rowCheckbox("Ada Lovelace")).not.toBeChecked();
  });

  it("drives checked state from selectedRowIds and updates via onSelectionChange (controlled)", async () => {
    const user = userEvent.setup();
    render(<ControlledSelection initial={["1"]} />);
    expect(rowCheckbox("Ada Lovelace")).toBeChecked();

    await user.click(rowCheckbox("Grace Hopper"));
    expect(screen.getByTestId("selection")).toHaveTextContent("1,3");
    expect(rowCheckbox("Grace Hopper")).toBeChecked();
  });

  it("locks non-selectable rows with aria-disabled (never the native attribute) and skips them in select-all", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        enableRowSelection={(p) => p.balance > 20}
        onSelectionChange={onSelectionChange}
      />,
    );
    const alan = rowCheckbox("Alan Turing");
    expect(alan).toHaveAttribute("aria-disabled", "true");
    expect(alan).not.toBeDisabled();
    rowCheckbox("Ada Lovelace").focus();
    await user.tab();
    expect(alan).toHaveFocus();

    await user.click(alan);
    expect(onSelectionChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    const [ids] = onSelectionChange.mock.calls.at(-1)!;
    expect([...ids].sort()).toEqual(["1", "3"]);
  });

  it("never shows a non-selectable row as checked, even if its id is seeded selected", () => {
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        enableRowSelection={(p) => p.balance > 20}
        defaultSelectedRowIds={["2"]}
      />,
    );
    const alan = rowCheckbox("Alan Turing");
    expect(alan).toHaveAttribute("aria-disabled", "true");
    expect(alan).not.toBeChecked();
  });

  it("owns its selection and reports both select and deselect when uncontrolled", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        enableRowSelection
        onSelectionChange={onSelectionChange}
      />,
    );
    await user.click(rowCheckbox("Ada Lovelace"));
    expect(rowCheckbox("Ada Lovelace")).toBeChecked();
    expect(onSelectionChange).toHaveBeenLastCalledWith(["1"], [people[0]]);

    await user.click(rowCheckbox("Ada Lovelace"));
    expect(rowCheckbox("Ada Lovelace")).not.toBeChecked();
    expect(onSelectionChange).toHaveBeenLastCalledWith([], []);
  });

  it("spans the selection column in the empty-state cell", () => {
    render(
      <DataTable
        aria-label="People"
        data={[]}
        columns={columns}
        empty="No people yet."
        getRowId={(p) => p.id}
        enableRowSelection
      />,
    );
    expect(screen.getByRole("cell", { name: "No people yet." })).toHaveAttribute("colspan", "4");
  });

  it("locks the select-all box when no row is selectable", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        enableRowSelection={() => false}
        onSelectionChange={onSelectionChange}
      />,
    );
    const selectAll = screen.getByRole("checkbox", { name: "Select all rows" });
    expect(selectAll).toHaveAttribute("aria-disabled", "true");
    expect(selectAll).not.toBeDisabled();
    expect(selectAll).not.toBePartiallyChecked();
    await user.click(selectAll);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("gives each group header a box that selects all of its rows", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        aria-label="Staff"
        data={staff}
        columns={groupedColumns}
        grouping={["role"]}
        getRowId={(p) => p.id}
        enableRowSelection
        onSelectionChange={onSelectionChange}
      />,
    );
    const groupRow = screen.getByRole("button", { name: /Collapse Engineering/ }).closest("tr");
    const groupBox = within(groupRow!).getByRole("checkbox");

    await user.click(groupBox);
    const [ids] = onSelectionChange.mock.calls.at(-1)!;
    expect([...ids].sort()).toEqual(["1", "2"]);
    expect(groupBox).toBeChecked();
  });

  it("keeps selected ids absent from data and reports only the matching rows", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        enableRowSelection
        defaultSelectedRowIds={["stale"]}
        onSelectionChange={onSelectionChange}
      />,
    );
    await user.click(rowCheckbox("Ada Lovelace"));
    const [ids, rows] = onSelectionChange.mock.calls.at(-1)!;
    expect([...ids].sort()).toEqual(["1", "stale"]);
    expect(rows).toEqual([people[0]]);
  });

  it("does not show the header as mixed when only a stale id is selected", () => {
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        enableRowSelection
        defaultSelectedRowIds={["stale"]}
      />,
    );
    const selectAll = screen.getByRole("checkbox", { name: "Select all rows" });
    expect(selectAll).not.toBeChecked();
    expect(selectAll).not.toBePartiallyChecked();
    expect(rowCheckbox("Ada Lovelace")).not.toBeChecked();
  });

  it("locks a group header whose rows are all non-selectable", () => {
    render(
      <DataTable
        aria-label="Staff"
        data={staff}
        columns={groupedColumns}
        grouping={["role"]}
        getRowId={(p) => p.id}
        enableRowSelection={(p) => p.balance > 50}
      />,
    );
    const researchRow = screen.getByRole("button", { name: /Collapse Research/ }).closest("tr");
    const researchBox = within(researchRow!).getByRole("checkbox");
    expect(researchBox).toHaveAttribute("aria-disabled", "true");
    expect(researchBox).not.toBeChecked();

    const engineeringRow = screen
      .getByRole("button", { name: /Collapse Engineering/ })
      .closest("tr");
    expect(within(engineeringRow!).getByRole("checkbox")).not.toHaveAttribute("aria-disabled");
  });
});

describe("DataTable row detail panels", () => {
  const detail = (p: Person) => <div>Detail for {p.name}</div>;

  it("adds no expander column or toggle unless renderDetailPanel is provided", () => {
    render(
      <DataTable aria-label="People" data={people} columns={columns} getRowId={(p) => p.id} />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
  });

  it("grows a leading expander column and a collapsed toggle per data row", () => {
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        renderDetailPanel={detail}
      />,
    );
    expect(screen.getAllByRole("columnheader")).toHaveLength(4);
    for (const person of people) {
      const toggle = screen.getByRole("button", { name: `Expand details for ${person.name}` });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    }
    expect(screen.queryByText(/^Detail for/)).not.toBeInTheDocument();
  });

  it("reveals the panel on toggle and hides it again", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        renderDetailPanel={detail}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Expand details for Ada Lovelace" }));
    expect(screen.getByText("Detail for Ada Lovelace")).toBeInTheDocument();

    const open = screen.getByRole("button", { name: "Collapse details for Ada Lovelace" });
    expect(open).toHaveAttribute("aria-expanded", "true");
    const panelId = open.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId!)).toHaveTextContent("Detail for Ada Lovelace");

    await user.click(open);
    expect(screen.queryByText("Detail for Ada Lovelace")).not.toBeInTheDocument();
    const collapsed = screen.getByRole("button", { name: "Expand details for Ada Lovelace" });
    expect(collapsed).not.toHaveAttribute("aria-controls");
  });

  it("calls renderDetailPanel only for open rows, with that row's datum", async () => {
    const user = userEvent.setup();
    const render_ = vi.fn((p: Person) => <div>Detail for {p.name}</div>);
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        renderDetailPanel={render_}
      />,
    );
    expect(render_).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Expand details for Ada Lovelace" }));
    expect(render_).toHaveBeenCalledWith(people[0]);
    const openedFor = render_.mock.calls.map(([p]) => p);
    expect(openedFor).toContain(people[0]);
    expect(openedFor).not.toContain(people[1]);
  });

  it("toggles panels independently", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        renderDetailPanel={detail}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Expand details for Ada Lovelace" }));
    await user.click(screen.getByRole("button", { name: "Expand details for Alan Turing" }));
    expect(screen.getByText("Detail for Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Detail for Alan Turing")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Collapse details for Ada Lovelace" }));
    expect(screen.queryByText("Detail for Ada Lovelace")).not.toBeInTheDocument();
    expect(screen.getByText("Detail for Alan Turing")).toBeInTheDocument();
  });

  it("spans the panel across every column, including the expander", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        renderDetailPanel={detail}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Expand details for Ada Lovelace" }));
    const panelCell = screen.getByText("Detail for Ada Lovelace").closest("td");
    expect(panelCell).toHaveAttribute("colspan", "4");
  });

  it("composes with selection: both leading columns, and the panel spans them", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        enableRowSelection
        renderDetailPanel={detail}
      />,
    );
    const adaRow = screen.getByText("Ada Lovelace").closest("tr")!;
    expect(within(adaRow).getByRole("checkbox")).toBeInTheDocument();
    const toggle = within(adaRow).getByRole("button", { name: "Expand details for Ada Lovelace" });

    await user.click(toggle);
    const panelCell = screen.getByText("Detail for Ada Lovelace").closest("td");
    expect(panelCell).toHaveAttribute("colspan", "5");
  });

  it("gives a detail toggle to data rows but not group headers", () => {
    render(
      <DataTable
        aria-label="Staff"
        data={staff}
        columns={groupedColumns}
        grouping={["role"]}
        getRowId={(p) => p.id}
        renderDetailPanel={detail}
      />,
    );
    const groupHeaderRow = screen
      .getByRole("button", { name: /Collapse Engineering/ })
      .closest("tr");
    expect(within(groupHeaderRow!).queryByRole("button", { name: /details for/ })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Expand details for Ada Lovelace" }),
    ).toBeInTheDocument();
  });

  it("spans the empty slot across the expander column too", () => {
    render(
      <DataTable
        aria-label="People"
        data={[]}
        columns={columns}
        empty="No people yet."
        getRowId={(p) => p.id}
        renderDetailPanel={detail}
      />,
    );
    expect(screen.getByRole("cell", { name: "No people yet." })).toHaveAttribute("colspan", "4");
  });

  it("gates which rows get a toggle with an enableRowExpansion predicate", () => {
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        renderDetailPanel={detail}
        enableRowExpansion={(p) => p.balance > 20}
      />,
    );
    expect(screen.getAllByRole("columnheader")).toHaveLength(4);
    expect(
      screen.getByRole("button", { name: "Expand details for Ada Lovelace" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Expand details for Grace Hopper" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Expand details for Alan Turing" })).toBeNull();
    const alanRow = screen.getByText("Alan Turing").closest("tr")!;
    expect(within(alanRow).getAllByRole("cell")[0]).toBeEmptyDOMElement();
  });

  it("never opens a panel for a row the predicate excludes", async () => {
    const user = userEvent.setup();
    const render_ = vi.fn((p: Person) => <div>Detail for {p.name}</div>);
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        renderDetailPanel={render_}
        enableRowExpansion={(p) => p.balance > 20}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Expand details for Ada Lovelace" }));
    expect(screen.getByText("Detail for Ada Lovelace")).toBeInTheDocument();
    expect(render_.mock.calls.map(([p]) => p)).not.toContain(people[1]);
  });

  it("treats enableRowExpansion={true} like the default — every row expandable", () => {
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        renderDetailPanel={detail}
        enableRowExpansion={true}
      />,
    );
    for (const person of people) {
      expect(
        screen.getByRole("button", { name: `Expand details for ${person.name}` }),
      ).toBeInTheDocument();
    }
  });

  it("drops the whole feature with enableRowExpansion={false}, even with a renderer", () => {
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        renderDetailPanel={detail}
        enableRowExpansion={false}
      />,
    );
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("names toggles by each row's own value in grouped mode, not the shared group value", () => {
    render(
      <DataTable
        aria-label="Employees"
        data={employees}
        columns={employeeColumns}
        grouping={["region", "role"]}
        getRowId={(e) => e.id}
        renderDetailPanel={(e) => <div>Detail for {e.name}</div>}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Expand details for Ada Lovelace" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Expand details for Grace Hopper" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Expand details for Tom Watson" }),
    ).toBeInTheDocument();
  });

  it("keeps panel ids valid and matched when getRowId returns values with spaces", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        aria-label="People"
        data={people}
        columns={columns}
        getRowId={(p) => `${p.name} #${p.id}`}
        renderDetailPanel={detail}
      />,
    );
    const toggle = screen.getByRole("button", { name: "Expand details for Ada Lovelace" });
    await user.click(toggle);

    const panelId = toggle.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    expect(panelId).not.toMatch(/\s/);
    expect(document.getElementById(panelId!)).toHaveTextContent("Detail for Ada Lovelace");
  });
});
