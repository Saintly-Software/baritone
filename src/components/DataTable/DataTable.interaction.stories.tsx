import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { createDataTableColumnHelper, DataTable } from "./index";

/**
 * Interaction coverage for `DataTable`'s grouping and row selection. These run in
 * a real browser (unlike the jsdom unit tests), driving the toggles and checkboxes
 * the way a user would — including Shift-click range selection, which needs a real
 * pointer event carrying the modifier key.
 */
interface Person {
  id: string;
  name: string;
  role: string;
  balance: number;
}

const people: Person[] = [
  { id: "1", name: "Ada Lovelace", role: "Engineering", balance: 4200 },
  { id: "2", name: "Grace Hopper", role: "Engineering", balance: 9600 },
  { id: "3", name: "Alan Turing", role: "Research", balance: 1875 },
  { id: "4", name: "Katherine Johnson", role: "Research", balance: 320 },
];

const col = createDataTableColumnHelper<Person>();
const columns = col.columns([
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

const meta: Meta<typeof DataTable<Person>> = {
  title: "Interaction Tests/DataTable",
  component: DataTable,
};
export default meta;

type Story = StoryObj<typeof DataTable<Person>>;

/** Collapsing a group hides its rows (and flips the toggle); expanding brings them back. */
export const CollapsesAndExpandsAGroup: Story = {
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const collapse = canvas.getByRole("button", { name: "Collapse Engineering" });
    expect(collapse).toHaveAttribute("aria-expanded", "true");
    expect(canvas.getByRole("cell", { name: "Ada Lovelace" })).toBeInTheDocument();

    await userEvent.click(collapse);
    await waitFor(() => {
      expect(canvas.queryByRole("cell", { name: "Ada Lovelace" })).not.toBeInTheDocument();
    });
    const expand = canvas.getByRole("button", { name: "Expand Engineering" });
    expect(expand).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(expand);
    await waitFor(() => {
      expect(canvas.getByRole("cell", { name: "Ada Lovelace" })).toBeInTheDocument();
    });
  },
};

/** Toggling one group leaves the others untouched. */
export const GroupsToggleIndependently: Story = {
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Collapse Engineering" }));
    await waitFor(() => {
      expect(canvas.queryByRole("cell", { name: "Ada Lovelace" })).not.toBeInTheDocument();
    });

    expect(canvas.getByRole("cell", { name: "Alan Turing" })).toBeInTheDocument();
    expect(canvas.getByRole("button", { name: "Collapse Research" })).toBeInTheDocument();
  },
};

/**
 * `groupDisplay="merge"`: the grouped column is dropped and its label shares the
 * host column with each leaf. Collapsing still hides exactly that group's leaves,
 * and the leaf value reads down the same column as the group value.
 */
export const MergedCollapsesAndExpands: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <DataTable
        caption="Team members by department"
        data={people}
        columns={columns}
        grouping={["role"]}
        groupDisplay="merge"
        getRowId={(p) => p.id}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getAllByRole("columnheader").map((h) => h.textContent)).toEqual([
      "Name",
      "Balance",
    ]);

    const collapse = canvas.getByRole("button", { name: "Collapse Engineering" });
    expect(canvas.getByText("Ada Lovelace")).toBeInTheDocument();

    await userEvent.click(collapse);
    await waitFor(() => {
      expect(canvas.queryByText("Ada Lovelace")).not.toBeInTheDocument();
    });
    const expand = canvas.getByRole("button", { name: "Expand Engineering" });
    expect(expand).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(expand);
    await waitFor(() => {
      expect(canvas.getByText("Ada Lovelace")).toBeInTheDocument();
    });
  },
};

/**
 * A controlled, selectable table that mirrors the current selection into a
 * `data-testid` node, so the play functions can assert on the public
 * `onSelectionChange` output rather than reaching into the checkboxes.
 */
function SelectableTable({
  grouping,
  enableRowSelection = true,
}: {
  grouping?: string[];
  enableRowSelection?: boolean | ((row: Person) => boolean);
}) {
  const [selected, setSelected] = React.useState<string[]>([]);
  return (
    <div style={{ maxWidth: 640 }}>
      <DataTable
        caption="Team members"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        grouping={grouping}
        enableRowSelection={enableRowSelection}
        selectedRowIds={selected}
        onSelectionChange={setSelected}
      />
      <p data-testid="selected">{[...selected].sort().join(",")}</p>
    </div>
  );
}

/** The checkbox inside the body row that renders the given name. */
function checkboxForRow(canvasElement: HTMLElement, name: string): HTMLInputElement {
  const row = within(canvasElement).getByText(name).closest("tr");
  if (!row) throw new Error(`No row for ${name}`);
  return within(row as HTMLElement).getByRole("checkbox") as HTMLInputElement;
}

/** Clicking a row's box selects it; clicking again clears it. */
export const SelectsAndClearsARow: Story = {
  render: () => <SelectableTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selected = () => canvas.getByTestId("selected").textContent;

    const graceBox = checkboxForRow(canvasElement, "Grace Hopper");
    expect(graceBox).not.toBeChecked();

    await userEvent.click(graceBox);
    await waitFor(() => expect(selected()).toBe("2"));
    expect(graceBox).toBeChecked();

    await userEvent.click(graceBox);
    await waitFor(() => expect(selected()).toBe(""));
    expect(graceBox).not.toBeChecked();
  },
};

/** The header box selects every row, then clears every row. */
export const SelectAllTogglesEveryRow: Story = {
  render: () => <SelectableTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectAll = canvas.getByRole("checkbox", { name: "Select all rows" });

    await userEvent.click(selectAll);
    await waitFor(() => expect(canvas.getByTestId("selected").textContent).toBe("1,2,3,4"));
    expect(selectAll).toBeChecked();

    await userEvent.click(selectAll);
    await waitFor(() => expect(canvas.getByTestId("selected").textContent).toBe(""));
    expect(selectAll).not.toBeChecked();
  },
};

/** With only some rows selected, the header box shows the mixed (indeterminate) state. */
export const HeaderGoesIndeterminateOnPartialSelection: Story = {
  render: () => <SelectableTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectAll = canvas.getByRole("checkbox", { name: "Select all rows" });

    await userEvent.click(checkboxForRow(canvasElement, "Ada Lovelace"));
    await waitFor(() => expect(canvas.getByTestId("selected").textContent).toBe("1"));

    expect(selectAll).toBePartiallyChecked();
    expect(selectAll).not.toBeChecked();
  },
};

/** Shift-clicking a second box selects the inclusive range from the last one. */
export const ShiftClickSelectsARange: Story = {
  render: () => <SelectableTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(checkboxForRow(canvasElement, "Ada Lovelace"));
    await waitFor(() => expect(canvas.getByTestId("selected").textContent).toBe("1"));

    checkboxForRow(canvasElement, "Alan Turing").dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, shiftKey: true }),
    );

    await waitFor(() => expect(canvas.getByTestId("selected").textContent).toBe("1,2,3"));
    expect(checkboxForRow(canvasElement, "Katherine Johnson")).not.toBeChecked();
  },
};

/** A group header's box selects (then clears) every row in that group at once. */
export const GroupHeaderSelectsItsRows: Story = {
  render: () => <SelectableTable grouping={["role"]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selected = () => canvas.getByTestId("selected").textContent;

    const engineeringRow = canvas
      .getByRole("button", { name: "Collapse Engineering" })
      .closest("tr");
    const engineeringBox = within(engineeringRow as HTMLElement).getByRole("checkbox");

    await userEvent.click(engineeringBox);
    await waitFor(() => expect(selected()).toBe("1,2"));
    expect(engineeringBox).toBeChecked();
    expect(canvas.getByRole("checkbox", { name: "Select all rows" })).toBePartiallyChecked();

    await userEvent.click(engineeringBox);
    await waitFor(() => expect(selected()).toBe(""));
    expect(engineeringBox).not.toBeChecked();
  },
};

/** Clicking a row's expander reveals its detail panel; clicking again hides it. */
export const ExpandsAndCollapsesADetailPanel: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <DataTable
        caption="Team members"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        renderDetailPanel={(person) => <div>Balance: ${person.balance}</div>}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const expand = canvas.getByRole("button", { name: "Expand details for Ada Lovelace" });
    expect(expand).toHaveAttribute("aria-expanded", "false");
    expect(canvas.queryByText("Balance: $4200")).not.toBeInTheDocument();

    await userEvent.click(expand);
    await waitFor(() => {
      expect(canvas.getByText("Balance: $4200")).toBeInTheDocument();
    });
    const collapse = canvas.getByRole("button", { name: "Collapse details for Ada Lovelace" });
    expect(collapse).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(collapse);
    await waitFor(() => {
      expect(canvas.queryByText("Balance: $4200")).not.toBeInTheDocument();
    });
  },
};

/** Opening one row's panel leaves every other row's panel closed. */
export const DetailPanelsToggleIndependently: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <DataTable
        caption="Team members"
        data={people}
        columns={columns}
        getRowId={(p) => p.id}
        renderDetailPanel={(person) => <div>Details: {person.name}</div>}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Expand details for Ada Lovelace" }));
    await waitFor(() => {
      expect(canvas.getByText("Details: Ada Lovelace")).toBeInTheDocument();
    });

    expect(canvas.queryByText("Details: Grace Hopper")).not.toBeInTheDocument();
    expect(canvas.getByRole("button", { name: "Expand details for Grace Hopper" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  },
};
