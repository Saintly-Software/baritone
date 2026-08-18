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
    <List
      {...args}
      items={[
        <List.Item key="alpha">
          <Cell>Alpha</Cell>
        </List.Item>,
        <List.Item key="bravo">
          <Cell>Bravo</Cell>
        </List.Item>,
        <List.Item key="charlie">
          <Cell>Charlie</Cell>
        </List.Item>,
      ]}
    />
  ),
};

/** The default `flex` layout, as a vertical stack (`direction="column"`). */
export const FlexColumn: Story = {
  render: () => (
    <Section label='layout="flex" · direction="column" · gap="2"'>
      <List
        direction="column"
        gap="2"
        items={[
          <List.Item key="first">
            <Cell>First</Cell>
          </List.Item>,
          <List.Item key="second">
            <Cell>Second</Cell>
          </List.Item>,
          <List.Item key="third">
            <Cell>Third</Cell>
          </List.Item>,
        ]}
      />
    </Section>
  ),
};

/** A horizontal `flex` row, centre-aligned. */
export const FlexRow: Story = {
  render: () => (
    <Section label='layout="flex" · direction="row" · align="center" · gap="4"'>
      <List
        direction="row"
        align="center"
        gap="4"
        items={[
          <List.Item key="one">
            <Cell>One</Cell>
          </List.Item>,
          <List.Item key="two">
            <Cell>Two</Cell>
          </List.Item>,
          <List.Item key="three">
            <Cell>Three</Cell>
          </List.Item>,
        ]}
      />
    </Section>
  ),
};

/** A wrapping `flex` row with `justify="between"` — items flow onto new lines. */
export const FlexWrap: Story = {
  render: () => (
    <Section label='layout="flex" · direction="row" · wrap · justify="between" · gap="2"'>
      <List
        direction="row"
        wrap
        justify="between"
        gap="2"
        items={["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel"].map(
          (label) => (
            <List.Item key={label}>
              <Cell>{label}</Cell>
            </List.Item>
          ),
        )}
      />
    </Section>
  ),
};

/** A `grid` layout: three equal columns, two equal rows. */
export const GridColumns: Story = {
  render: () => (
    <Section label='layout="grid" · columns={3} · rows={2} · gap="4"'>
      <List
        layout="grid"
        columns={3}
        rows={2}
        gap="4"
        items={["A", "B", "C", "D", "E", "F"].map((label) => (
          <List.Item key={label}>
            <Cell>{label}</Cell>
          </List.Item>
        ))}
      />
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
        items={[
          <List.Item key="header" area="header">
            <Cell>header</Cell>
          </List.Item>,
          <List.Item key="nav" area="nav">
            <Cell>nav</Cell>
          </List.Item>,
          <List.Item key="main" area="main">
            <Cell>main</Cell>
          </List.Item>,
          <List.Item key="footer" area="footer">
            <Cell>footer</Cell>
          </List.Item>,
        ]}
      />
    </Section>
  ),
};

/** `ordered` renders an `<ol>` (semantic sequence) — the marker is still stripped. */
export const Ordered: Story = {
  render: () => (
    <Section label="ordered · renders <ol>">
      <List
        ordered
        direction="column"
        gap="2"
        items={[
          <List.Item key="1">
            <Cell>Step one</Cell>
          </List.Item>,
          <List.Item key="2">
            <Cell>Step two</Cell>
          </List.Item>,
          <List.Item key="3">
            <Cell>Step three</Cell>
          </List.Item>,
        ]}
      />
    </Section>
  ),
};

/** Data-driven: map a data array to `List.Item` elements, keyed by a stable id. */
export const FromDataArray: Story = {
  render: () => {
    const people = [
      { id: "a", name: "Ada" },
      { id: "b", name: "Alan" },
      { id: "c", name: "Grace" },
    ];
    return (
      <Section label="items array · mapped from data · keyed by id">
        <List
          direction="column"
          gap="2"
          items={people.map((person) => (
            <List.Item key={person.id}>
              <Cell>{person.name}</Cell>
            </List.Item>
          ))}
        />
      </Section>
    );
  },
};
