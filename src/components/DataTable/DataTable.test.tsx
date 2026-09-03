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
    // `DataTableName` forbids this at compile time; the runtime guard catches JS
    // callers/casts that slip past it. Silence React's expected-throw error log.
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

// Roles repeat, so grouping gathers rows; balance rolls up to a per-group sum.
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

// A two-dimension dataset (region → role) for nested grouping: Americas holds
// 3 data rows across 2 role sub-groups.
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
    // Americas holds 3 data rows across 2 role sub-groups (Engineering ×2, Sales
    // ×1); its header must count the 3 rows, not the 2 sub-groups, so "(2)" is a
    // lone match — a buggy direct-child count would show it twice.
    expect(screen.getByText("(3)")).toBeInTheDocument();
    expect(screen.getByText("(2)")).toBeInTheDocument();
    expect(screen.getByText("(1)")).toBeInTheDocument();
  });

  it("keeps the grouped column (default groupDisplay='columns') — a regression guard", () => {
    // The default presentation is unchanged: the grouped column stays its own
    // column, so passing `groupDisplay="columns"` explicitly is identical to omitting it.
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
    // Byte-for-byte: the explicit default renders the same table markup as omitting it.
    expect(explicit.querySelector("table")!.outerHTML).toBe(
      implicit.querySelector("table")!.outerHTML,
    );
  });
});

// Depth published by the merged label's inline `--groupDepth` var (via
// `assignInlineVars`) in the element's `style` attribute.
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
    // One fewer column: the grouped "Role" header is gone; Name (host) and Balance remain.
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
    // The group label (toggle + value + count) is hosted in the Name column...
    const toggle = screen.getByRole("button", { name: /Engineering/ });
    const headerRow = toggle.closest("tr")!;
    expect(within(headerRow).getByText("Engineering")).toBeInTheDocument();
    expect(within(headerRow).getByText("(2)")).toBeInTheDocument();
    // ...and the aggregated Balance total still renders on that same header row.
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
    // The leaf's Name value lives in the host column, deeper than its group header.
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
    // Only Name survives as a column (region + role are both grouped away).
    expect(screen.getAllByRole("columnheader").map((h) => h.textContent)).toEqual(["Name"]);

    const region = screen.getByRole("button", { name: /Americas/ }).parentElement!;
    const role = screen.getByRole("button", { name: /Engineering/ }).parentElement!;
    const leaf = screen.getByText("Ada Lovelace");
    // Region (depth 0) < role sub-group (depth 1) < leaf (depth 2).
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
    // "Role" is dropped, so the empty cell spans Name + Balance (2), not 3.
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
    // With no `grouping`, merge changes nothing — same markup as the default.
    expect(merged.querySelector("table")!.outerHTML).toBe(plain.querySelector("table")!.outerHTML);
  });

  it("honours meta.groupLabel to pick the host column", () => {
    // Put the label on Balance instead of the first column (Name).
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
    // The toggle lives in Balance's group cell, not Name's; Name's cell is empty.
    const headerRow = screen.getByRole("button", { name: /Engineering/ }).closest("tr")!;
    const cells = within(headerRow).getAllByRole("cell");
    expect(within(cells[1]!).getByText("Engineering")).toBeInTheDocument();
    expect(cells[0]!.textContent).toBe("");
  });

  it("keeps the aggregate: the default host skips an aggregated column", () => {
    // Two columns: grouped `category` and summed `amount`. The label must not
    // hijack the aggregated column — `category` stays as the outline so the total still renders.
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
    // Both columns stay (the grouped Category hosts the outline)...
    expect(screen.getAllByRole("columnheader").map((h) => h.textContent)).toEqual([
      "Category",
      "Amount",
    ]);
    // ...and the Housing header row shows both its label and the summed total.
    const headerRow = screen.getByRole("button", { name: /Housing/ }).closest("tr")!;
    expect(within(headerRow).getByText("Housing")).toBeInTheDocument();
    expect(within(headerRow).getByRole("cell", { name: "$140" })).toBeInTheDocument();
  });

  it("still renders a usable host when every column is grouped", () => {
    // With no non-grouped column left, the innermost grouped column stays on as
    // the host, so group rows keep their toggle + label + count instead of collapsing to zero.
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
    // One outline column survives, and its group rows have a working toggle + count.
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
    // Each row's box carries a distinct name (from its first cell), not a generic
    // "Select row" — `getByRole` also throws on a missing/duplicate name, so this
    // asserts exactly one box per row.
    for (const person of people) {
      expect(screen.getByRole("checkbox", { name: `Select ${person.name}` })).toBeInTheDocument();
    }
  });

  it("names a row from its first usable cell, skipping a leading empty/display cell", () => {
    // A leading display column has no value, so the label falls to the next usable cell.
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
    // ids first, then the matching rows from `data` (Ada is id "1").
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
    // Id "2" is Alan Turing.
    expect(rowCheckbox("Alan Turing")).toBeChecked();
    expect(rowCheckbox("Ada Lovelace")).not.toBeChecked();
  });

  it("drives checked state from selectedRowIds and updates via onSelectionChange (controlled)", async () => {
    const user = userEvent.setup();
    render(<ControlledSelection initial={["1"]} />);
    expect(rowCheckbox("Ada Lovelace")).toBeChecked();

    await user.click(rowCheckbox("Grace Hopper"));
    // The parent applied the change: Grace (id "3") joined the selection.
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
        // Only rows with a balance over 20 are selectable — Alan (18) is not.
        enableRowSelection={(p) => p.balance > 20}
        onSelectionChange={onSelectionChange}
      />,
    );
    const alan = rowCheckbox("Alan Turing");
    expect(alan).toHaveAttribute("aria-disabled", "true");
    // Focusable, not removed from the tab order (the native attribute would yank
    // it out) — AGENTS.md's convention: a disabled control stays keyboard-reachable.
    expect(alan).not.toBeDisabled();
    rowCheckbox("Ada Lovelace").focus();
    await user.tab();
    expect(alan).toHaveFocus();

    // Clicking the locked box does nothing.
    await user.click(alan);
    expect(onSelectionChange).not.toHaveBeenCalled();

    // Select-all covers only the selectable rows (Ada "1", Grace "3").
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
        // Alan ("2", balance 18) is not selectable...
        enableRowSelection={(p) => p.balance > 20}
        // ...but a stale/seeded id still lists him as selected.
        defaultSelectedRowIds={["2"]}
      />,
    );
    const alan = rowCheckbox("Alan Turing");
    expect(alan).toHaveAttribute("aria-disabled", "true");
    // The locked box can't be cleared, so it must not read as checked.
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
        // No `selectedRowIds` → the table owns selection in its own state.
        enableRowSelection
        onSelectionChange={onSelectionChange}
      />,
    );
    await user.click(rowCheckbox("Ada Lovelace"));
    expect(rowCheckbox("Ada Lovelace")).toBeChecked();
    expect(onSelectionChange).toHaveBeenLastCalledWith(["1"], [people[0]]);

    // Clicking again clears it — the internally-owned state updates both ways.
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
    // 3 data columns + the selection column.
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
        // A predicate that excludes every row leaves nothing for select-all to do.
        enableRowSelection={() => false}
        onSelectionChange={onSelectionChange}
      />,
    );
    const selectAll = screen.getByRole("checkbox", { name: "Select all rows" });
    // Locked via aria-disabled (never the native attribute), so it stays focusable.
    expect(selectAll).toHaveAttribute("aria-disabled", "true");
    expect(selectAll).not.toBeDisabled();
    // The box reads as unchecked (its visual state follows the `checked` prop).
    expect(selectAll).not.toBePartiallyChecked();
    // Clicking the locked box is a no-op: no selection, no callback.
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
    // The Engineering group's box lives in its header row (alongside the toggle).
    const groupRow = screen.getByRole("button", { name: /Collapse Engineering/ }).closest("tr");
    const groupBox = within(groupRow!).getByRole("checkbox");

    await user.click(groupBox);
    // Engineering holds Ada ("1") and Grace ("2"); Research is untouched.
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
        // "stale" matches no current row (e.g. paged/filtered out).
        defaultSelectedRowIds={["stale"]}
        onSelectionChange={onSelectionChange}
      />,
    );
    await user.click(rowCheckbox("Ada Lovelace"));
    const [ids, rows] = onSelectionChange.mock.calls.at(-1)!;
    // The stale id survives in the ids (the source of truth)...
    expect([...ids].sort()).toEqual(["1", "stale"]);
    // ...but only rows present in `data` come back (Ada is id "1").
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
    // No real row is selected, so the header is neither checked nor mixed.
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
        // Only balances over 50 qualify: Research has no selectable leaf (Alan is $18).
        enableRowSelection={(p) => p.balance > 50}
      />,
    );
    const researchRow = screen.getByRole("button", { name: /Collapse Research/ }).closest("tr");
    const researchBox = within(researchRow!).getByRole("checkbox");
    // Its box is locked (not a checked no-op) and stays focusable via aria-disabled.
    expect(researchBox).toHaveAttribute("aria-disabled", "true");
    expect(researchBox).not.toBeChecked();

    // Engineering has a selectable leaf, so its box stays active.
    const engineeringRow = screen
      .getByRole("button", { name: /Collapse Engineering/ })
      .closest("tr");
    expect(within(engineeringRow!).getByRole("checkbox")).not.toHaveAttribute("aria-disabled");
  });
});

describe("DataTable row detail panels", () => {
  // Keyed off the row's datum so a test can assert the right data reached the renderer.
  const detail = (p: Person) => <div>Detail for {p.name}</div>;

  it("adds no expander column or toggle unless renderDetailPanel is provided", () => {
    render(
      <DataTable aria-label="People" data={people} columns={columns} getRowId={(p) => p.id} />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    // No leading expander column: only the three data columns.
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
    // The extra (empty) expander header sits ahead of the three data columns.
    expect(screen.getAllByRole("columnheader")).toHaveLength(4);
    // Each data row has a toggle named from its own value, starting collapsed.
    for (const person of people) {
      const toggle = screen.getByRole("button", { name: `Expand details for ${person.name}` });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    }
    // Nothing is rendered until a row is opened.
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

    // The toggle flips to "Collapse" / aria-expanded=true and points at the panel.
    const open = screen.getByRole("button", { name: "Collapse details for Ada Lovelace" });
    expect(open).toHaveAttribute("aria-expanded", "true");
    const panelId = open.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId!)).toHaveTextContent("Detail for Ada Lovelace");

    await user.click(open);
    expect(screen.queryByText("Detail for Ada Lovelace")).not.toBeInTheDocument();
    // Collapsed again: no dangling aria-controls to an absent panel.
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
    // Never invoked while every panel is collapsed.
    expect(render_).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Expand details for Ada Lovelace" }));
    // Ada is people[0]; only her datum is passed.
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

    // Closing one leaves the other open.
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
    // 1 expander + 3 data columns.
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
    // Ada's row carries both a checkbox and an expander toggle.
    const adaRow = screen.getByText("Ada Lovelace").closest("tr")!;
    expect(within(adaRow).getByRole("checkbox")).toBeInTheDocument();
    const toggle = within(adaRow).getByRole("button", { name: "Expand details for Ada Lovelace" });

    await user.click(toggle);
    // expander + selection + 3 data columns.
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
    // The group header carries its group toggle but no detail toggle.
    const groupHeaderRow = screen
      .getByRole("button", { name: /Collapse Engineering/ })
      .closest("tr");
    expect(within(groupHeaderRow!).queryByRole("button", { name: /details for/ })).toBeNull();
    // A data row under it does get one.
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
    // 3 data columns + the expander column.
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
        // Only balances over 20 are expandable — Alan (18) is not.
        enableRowExpansion={(p) => p.balance > 20}
      />,
    );
    // The expander column still renders (its header is present)...
    expect(screen.getAllByRole("columnheader")).toHaveLength(4);
    // ...with a toggle on the eligible rows...
    expect(
      screen.getByRole("button", { name: "Expand details for Ada Lovelace" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Expand details for Grace Hopper" }),
    ).toBeInTheDocument();
    // ...but none on the excluded row (its expander cell is simply empty).
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
    // The eligible row still opens...
    await user.click(screen.getByRole("button", { name: "Expand details for Ada Lovelace" }));
    expect(screen.getByText("Detail for Ada Lovelace")).toBeInTheDocument();
    // ...and the excluded row is never rendered (no toggle exists to open it).
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
    // No expander column and no toggles — the renderer is inert.
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("names toggles by each row's own value in grouped mode, not the shared group value", () => {
    // Grouped columns (region, role) carry the shared group value on leaf rows;
    // the toggle name must fall through to the row's own distinguishing value (name).
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
    // getByRole throws on a duplicated name, so this also asserts the labels are distinct.
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
    // A composite id with whitespace must not leak into the DOM id / aria-controls.
    // The panel id is keyed off render position, so aria-controls still resolves.
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
    // A valid HTML id has no whitespace, and the reference resolves to the panel.
    expect(panelId).not.toMatch(/\s/);
    expect(document.getElementById(panelId!)).toHaveTextContent("Detail for Ada Lovelace");
  });
});
