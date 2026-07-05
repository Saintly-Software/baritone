import type { Meta, StoryObj } from "@storybook/react-vite";
import { SPACE_KEYS } from "../../theme/constants";
import { Grid } from "./index";

const meta: Meta<typeof Grid> = {
  title: "Layout/Grid",
  component: Grid,
  argTypes: {
    align: { control: "select", options: ["start", "center", "end", "stretch", "baseline"] },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between", "around", "evenly"],
    },
    gap: { control: "select", options: SPACE_KEYS },
    inline: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof Grid>;

const Box = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: "8px 16px",
      borderRadius: 8,
      background: "var(--baritone-color-primary-500, #6366f1)",
      color: "white",
    }}
  >
    {children}
  </div>
);

const Area = ({ area, children }: { area: string; children: React.ReactNode }) => (
  <div
    style={{
      gridArea: area,
      display: "grid",
      placeItems: "center",
      padding: 16,
      borderRadius: 8,
      background: "var(--baritone-color-primary-500, #6366f1)",
      color: "white",
    }}
  >
    {children}
  </div>
);

export const Playground: Story = {
  args: { columns: 3, gap: "4" },
  render: (args) => (
    <Grid {...args}>
      {Array.from({ length: 6 }, (_, i) => (
        <Box key={i}>Item {i + 1}</Box>
      ))}
    </Grid>
  ),
};

export const EqualColumns: Story = {
  render: () => (
    <Grid columns={4} gap="3">
      {Array.from({ length: 8 }, (_, i) => (
        <Box key={i}>{i + 1}</Box>
      ))}
    </Grid>
  ),
};

export const MixedTracks: Story = {
  render: () => (
    <Grid columns="200px 1fr" gap="4">
      <Box>Sidebar (200px)</Box>
      <Box>Main (1fr)</Box>
    </Grid>
  ),
};

export const ResponsiveAutoFill: Story = {
  render: () => (
    <Grid columns="repeat(auto-fill, minmax(8rem, 1fr))" gap="3">
      {Array.from({ length: 10 }, (_, i) => (
        <Box key={i}>Card {i + 1}</Box>
      ))}
    </Grid>
  ),
};

/**
 * `areas` takes the friendly array/multi-line form — you write the cell names,
 * Grid handles the per-row quoting that `grid-template-areas` requires.
 */
export const TemplateAreas: Story = {
  render: () => (
    <Grid
      areas={["header header", "nav main", "footer footer"]}
      columns="160px 1fr"
      rows="auto 1fr auto"
      gap="3"
      style={{ minHeight: 320 }}
    >
      <Area area="header">header</Area>
      <Area area="nav">nav</Area>
      <Area area="main">main</Area>
      <Area area="footer">footer</Area>
    </Grid>
  ),
};
