import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { createDataTableColumnHelper, DataTable } from "./index";

/**
 * Interaction coverage for `DataTable`'s grouping. These run in a real browser
 * (unlike the jsdom unit tests), driving the expand/collapse toggles the way a
 * user would. Each story groups by `role`, then asserts that a group's toggle
 * hides and reveals exactly its own rows, that its accessible name and
 * `aria-expanded` flip, and that groups toggle independently of one another.
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

    // Groups start expanded: an Engineering leaf is on screen, toggle says "Collapse".
    const collapse = canvas.getByRole("button", { name: "Collapse Engineering" });
    expect(collapse).toHaveAttribute("aria-expanded", "true");
    expect(canvas.getByRole("cell", { name: "Ada Lovelace" })).toBeInTheDocument();

    // Collapse it — its rows go away and the toggle becomes "Expand" / aria-expanded=false.
    await userEvent.click(collapse);
    await waitFor(() => {
      expect(canvas.queryByRole("cell", { name: "Ada Lovelace" })).not.toBeInTheDocument();
    });
    const expand = canvas.getByRole("button", { name: "Expand Engineering" });
    expect(expand).toHaveAttribute("aria-expanded", "false");

    // Expand again — the rows return.
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

    // Collapse Engineering only.
    await userEvent.click(canvas.getByRole("button", { name: "Collapse Engineering" }));
    await waitFor(() => {
      expect(canvas.queryByRole("cell", { name: "Ada Lovelace" })).not.toBeInTheDocument();
    });

    // Research stays open — its rows are still there and its toggle still says "Collapse".
    expect(canvas.getByRole("cell", { name: "Alan Turing" })).toBeInTheDocument();
    expect(canvas.getByRole("button", { name: "Collapse Research" })).toBeInTheDocument();
  },
};
