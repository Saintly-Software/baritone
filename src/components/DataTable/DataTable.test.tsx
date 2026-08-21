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
    // Each row's box carries a distinct, row-specific name (from its first cell)
    // instead of a generic "Select row", so assistive tech can tell them apart.
    // `getByRole` throws if a name is missing or duplicated, so this also asserts
    // there's exactly one box per data row.
    for (const person of people) {
      expect(screen.getByRole("checkbox", { name: `Select ${person.name}` })).toBeInTheDocument();
    }
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
    // Focusable, not removed from the tab order.
    expect(alan).not.toBeDisabled();

    // Clicking the locked box does nothing.
    await user.click(alan);
    expect(onSelectionChange).not.toHaveBeenCalled();

    // Select-all covers only the selectable rows (Ada "1", Grace "3").
    await user.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    const [ids] = onSelectionChange.mock.calls.at(-1)!;
    expect([...ids].sort()).toEqual(["1", "3"]);
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
        // Only balances over 50 are selectable: Engineering has Grace ($96),
        // but Research holds only Alan ($18) — no selectable leaf.
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
