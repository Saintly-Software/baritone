import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SegmentedBar, type SegmentedBarSegment } from "./index";

const SEGMENTS: SegmentedBarSegment[] = [
  { id: "sanity", label: "Sanity", value: 6 },
  { id: "music", label: "Music", value: 3 },
  { id: "health", label: "Health", value: 1 },
];

/** The legend `<li>`s, in order. */
function legendRows() {
  return within(screen.getByRole("list")).getAllByRole("listitem");
}

describe("SegmentedBar", () => {
  it("renders one legend row per segment, in order", () => {
    render(<SegmentedBar aria-label="Areas" segments={SEGMENTS} />);
    const rows = legendRows();
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent("Sanity");
    expect(rows[1]).toHaveTextContent("Music");
    expect(rows[2]).toHaveTextContent("Health");
  });

  it("computes each share against the sum of the values", () => {
    render(<SegmentedBar aria-label="Areas" segments={SEGMENTS} />);
    // 6 / 3 / 1 of 10.
    expect(legendRows()[0]).toHaveTextContent("60%");
    expect(legendRows()[1]).toHaveTextContent("30%");
    expect(legendRows()[2]).toHaveTextContent("10%");
  });

  it("computes shares against an explicit total, leaving a remainder", () => {
    render(<SegmentedBar aria-label="Quota" segments={SEGMENTS} total={20} />);
    expect(legendRows()[0]).toHaveTextContent("30%");
    expect(legendRows()[1]).toHaveTextContent("15%");
  });

  it("ignores a total below the sum of the values", () => {
    render(<SegmentedBar aria-label="Quota" segments={SEGMENTS} total={5} />);
    // Falls back to the sum (10), rather than reporting shares over 100%.
    expect(legendRows()[0]).toHaveTextContent("60%");
  });

  it("shows the raw value alongside the share", () => {
    render(<SegmentedBar aria-label="Areas" segments={SEGMENTS} />);
    expect(legendRows()[0]).toHaveTextContent("6");
  });

  it("formats values with format / locale", () => {
    render(
      <SegmentedBar
        aria-label="Spend"
        segments={[{ id: "a", label: "Hosting", value: 1200 }]}
        format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
        locale="en-US"
      />,
    );
    expect(legendRows()[0]).toHaveTextContent("$1,200");
  });

  it("hides the percentage and value columns on request", () => {
    render(
      <SegmentedBar aria-label="Areas" segments={SEGMENTS} showPercent={false} showValue={false} />,
    );
    const row = legendRows()[0];
    expect(row).toHaveTextContent("Sanity");
    expect(row).not.toHaveTextContent("60%");
  });

  it("names the legend list with the visible label", () => {
    render(<SegmentedBar label="This week by area" segments={SEGMENTS} />);
    expect(screen.getByRole("list", { name: "This week by area" })).toBeInTheDocument();
  });

  it("names the legend list with aria-label when there's no visible label", () => {
    render(<SegmentedBar aria-label="This week by area" segments={SEGMENTS} />);
    expect(screen.getByRole("list", { name: "This week by area" })).toBeInTheDocument();
    // …and renders no visible label of its own.
    expect(screen.queryByText("This week by area")).not.toBeInTheDocument();
  });

  it("names the legend list with aria-labelledby", () => {
    render(
      <>
        <h2 id="areas-heading">Areas</h2>
        <SegmentedBar aria-labelledby="areas-heading" segments={SEGMENTS} />
      </>,
    );
    expect(screen.getByRole("list", { name: "Areas" })).toBeInTheDocument();
  });

  it("keeps the legend in the accessibility tree when it is visually hidden", () => {
    render(<SegmentedBar aria-label="Areas" segments={SEGMENTS} showLegend={false} />);
    // The track is a picture; the legend carries the numbers, so hiding it
    // must never mean removing it.
    expect(legendRows()).toHaveLength(3);
    expect(screen.getByRole("list")).toHaveTextContent("Sanity");
  });

  it("shows the total only when asked", () => {
    const { rerender } = render(<SegmentedBar label="Areas" segments={SEGMENTS} />);
    expect(screen.queryByText("10")).not.toBeInTheDocument();
    rerender(<SegmentedBar label="Areas" segments={SEGMENTS} showTotal />);
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("floors negative values at zero", () => {
    render(
      <SegmentedBar
        aria-label="Areas"
        segments={[
          { id: "a", label: "A", value: 3 },
          { id: "b", label: "B", value: -5 },
        ]}
      />,
    );
    expect(legendRows()[0]).toHaveTextContent("100%");
    expect(legendRows()[1]).toHaveTextContent("0%");
  });

  it("reports 0% for every segment when nothing has a value", () => {
    render(
      <SegmentedBar
        aria-label="Areas"
        segments={[
          { id: "a", label: "A", value: 0 },
          { id: "b", label: "B", value: 0 },
        ]}
      />,
    );
    // No division by zero — an empty bar reads as all-zero, not NaN.
    expect(legendRows()[0]).toHaveTextContent("0%");
    expect(legendRows()[1]).toHaveTextContent("0%");
  });

  it("renders an empty bar without a legend row", () => {
    render(<SegmentedBar aria-label="Areas" segments={[]} />);
    expect(within(screen.getByRole("list")).queryAllByRole("listitem")).toHaveLength(0);
  });

  it("keeps the track out of the accessibility tree", () => {
    const { container } = render(<SegmentedBar aria-label="Areas" segments={SEGMENTS} />);
    // One aria-hidden track (the slices are its children, so they go with it).
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
    // The bar's only announced content is the legend.
    expect(screen.getAllByRole("list")).toHaveLength(1);
  });

  it("paints a custom-coloured segment through the fill variable", () => {
    const { container } = render(
      <SegmentedBar
        aria-label="Areas"
        segments={[{ id: "a", label: "A", value: 1, color: "#7b61ff" }]}
      />,
    );
    const painted = [...container.querySelectorAll<HTMLElement>("[style]")].filter((element) =>
      element.getAttribute("style")?.includes("#7b61ff"),
    );
    // Both of the segment's marks — the slice and its legend swatch.
    expect(painted).toHaveLength(2);
  });

  it("forwards slotProps onto the text slots", () => {
    render(
      <SegmentedBar
        label="Areas"
        segments={SEGMENTS}
        showTotal
        slotProps={{
          label: { className: "slot-label" },
          total: { className: "slot-total" },
          segmentLabel: { className: "slot-segment-label" },
          percent: { className: "slot-percent" },
          value: { className: "slot-value" },
        }}
      />,
    );
    expect(screen.getByText("Areas")).toHaveClass("slot-label");
    expect(screen.getByText("10")).toHaveClass("slot-total");
    expect(screen.getByText("Sanity")).toHaveClass("slot-segment-label");
    expect(screen.getByText("60%")).toHaveClass("slot-percent");
    expect(screen.getByText("6")).toHaveClass("slot-value");
  });

  it("merges a className onto the root", () => {
    const { container } = render(
      <SegmentedBar aria-label="Areas" segments={SEGMENTS} className="custom-root" />,
    );
    expect(container.firstElementChild).toHaveClass("custom-root");
  });
});
