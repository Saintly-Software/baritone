import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { SPACE_KEYS } from "../../theme/constants";
import { Card } from "../Card";
import { Text } from "../Text";
import { List } from "./index";

const meta: Meta<typeof List> = {
  title: "Components/List",
  component: List,
  args: { layout: "flex", ordered: false, gap: "2", direction: "column" },
  argTypes: {
    layout: { control: "inline-radio", options: ["flex", "grid"] },
    ordered: { control: "boolean" },
    gap: { control: "select", options: SPACE_KEYS },
    direction: { control: "inline-radio", options: ["row", "column"] },
    align: { control: "select", options: ["start", "center", "end", "stretch", "baseline"] },
    justify: {
      control: "select",
      options: ["start", "center", "end", "between", "around", "evenly"],
    },
    wrap: { control: "boolean" },
    items: { table: { disable: true } },
    children: { table: { disable: true } },
  },
};
export default meta;

type Story = StoryObj<typeof List>;

/** A captioned example, stacked label-over-content. */
const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <Text size="sm" saliency="low">
      {label}
    </Text>
    {children}
  </div>
);

/** A padded cell so the flex/grid layout is easy to see. */
const Cell = ({ children }: { children: React.ReactNode }) => (
  <Card>
    <Text size="sm">{children}</Text>
  </Card>
);

/** Fully wired to the controls — flip `layout` / `direction` / `gap` in the panel. */
export const Playground: Story = {
  render: (args) => (
    <List {...args}>
      <List.Item>
        <Cell>Alpha</Cell>
      </List.Item>
      <List.Item>
        <Cell>Bravo</Cell>
      </List.Item>
      <List.Item>
        <Cell>Charlie</Cell>
      </List.Item>
    </List>
  ),
};

/** The default `flex` layout, as a vertical stack (`direction="column"`). */
export const FlexColumn: Story = {
  render: () => (
    <Section label='layout="flex" · direction="column" · gap="2"'>
      <List direction="column" gap="2">
        <List.Item>
          <Cell>First</Cell>
        </List.Item>
        <List.Item>
          <Cell>Second</Cell>
        </List.Item>
        <List.Item>
          <Cell>Third</Cell>
        </List.Item>
      </List>
    </Section>
  ),
};

/** A horizontal `flex` row, centre-aligned. */
export const FlexRow: Story = {
  render: () => (
    <Section label='layout="flex" · direction="row" · align="center" · gap="4"'>
      <List direction="row" align="center" gap="4">
        <List.Item>
          <Cell>One</Cell>
        </List.Item>
        <List.Item>
          <Cell>Two</Cell>
        </List.Item>
        <List.Item>
          <Cell>Three</Cell>
        </List.Item>
      </List>
    </Section>
  ),
};

/** A wrapping `flex` row with `justify="between"` — items flow onto new lines. */
export const FlexWrap: Story = {
  render: () => (
    <Section label='layout="flex" · direction="row" · wrap · justify="between" · gap="2"'>
      <List direction="row" wrap justify="between" gap="2">
        {["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel"].map((label) => (
          <List.Item key={label}>
            <Cell>{label}</Cell>
          </List.Item>
        ))}
      </List>
    </Section>
  ),
};

/** A `grid` layout: three equal columns, two equal rows. */
export const GridColumns: Story = {
  render: () => (
    <Section label='layout="grid" · columns={3} · rows={2} · gap="4"'>
      <List layout="grid" columns={3} rows={2} gap="4">
        {["A", "B", "C", "D", "E", "F"].map((label) => (
          <List.Item key={label}>
            <Cell>{label}</Cell>
          </List.Item>
        ))}
      </List>
    </Section>
  ),
};

/** A `grid` layout with named areas — items are placed via `List.Item`'s `area`. */
export const GridAreas: Story = {
  render: () => (
    <Section label='layout="grid" · areas · columns="120px 1fr"'>
      <List
        layout="grid"
        gap="3"
        columns="120px 1fr"
        areas={[
          ["header", "header"],
          ["nav", "main"],
          ["footer", "footer"],
        ]}
      >
        <List.Item area="header">
          <Cell>header</Cell>
        </List.Item>
        <List.Item area="nav">
          <Cell>nav</Cell>
        </List.Item>
        <List.Item area="main">
          <Cell>main</Cell>
        </List.Item>
        <List.Item area="footer">
          <Cell>footer</Cell>
        </List.Item>
      </List>
    </Section>
  ),
};

/** `ordered` renders an `<ol>` (semantic sequence) — the marker is still stripped. */
export const Ordered: Story = {
  render: () => (
    <Section label="ordered · renders <ol>">
      <List ordered direction="column" gap="2">
        <List.Item>
          <Cell>Step one</Cell>
        </List.Item>
        <List.Item>
          <Cell>Step two</Cell>
        </List.Item>
        <List.Item>
          <Cell>Step three</Cell>
        </List.Item>
      </List>
    </Section>
  ),
};

/** Data-driven: pass an `items` array of `List.Item` props instead of children. */
export const FromItemsArray: Story = {
  render: () => (
    <Section label="items array · keyed by id">
      <List
        direction="column"
        gap="2"
        items={[
          { id: "a", children: <Cell>Ada</Cell> },
          { id: "b", children: <Cell>Alan</Cell> },
          { id: "c", children: <Cell>Grace</Cell> },
        ]}
      />
    </Section>
  ),
};
