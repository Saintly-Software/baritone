import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Meter } from "./index";

describe("Meter", () => {
  it("renders a meter named by its visible label", () => {
    render(<Meter label="Storage used" value={72} />);
    const meter = screen.getByRole("meter", { name: "Storage used" });
    expect(meter).toBeInTheDocument();
  });

  it("exposes the value and default 0–100 range to assistive tech", () => {
    render(<Meter label="Storage" value={72} />);
    const meter = screen.getByRole("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "72");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
  });

  it("honours a custom min / max", () => {
    render(<Meter label="Temperature" min={-20} max={40} value={22} />);
    const meter = screen.getByRole("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "22");
    expect(meter).toHaveAttribute("aria-valuemin", "-20");
    expect(meter).toHaveAttribute("aria-valuemax", "40");
  });

  it("clamps the reported value into the range", () => {
    render(<Meter label="Over" value={150} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "100");
  });

  it("defaults aria-valuetext to the formatted percentage", () => {
    render(<Meter label="Storage" value={72} />);
    // The default association must survive: we never forward an undefined
    // aria-valuetext (base-ui's merge would clobber the computed default).
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "72%");
  });

  it("forwards a string aria-valuetext verbatim", () => {
    render(<Meter label="Storage" value={72} aria-valuetext="72 of 100 GB" />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "72 of 100 GB");
  });

  it("forwards a function aria-valuetext to base-ui's getAriaValueText", () => {
    render(
      <Meter
        label="Storage"
        value={72}
        aria-valuetext={(formatted, value) => `${value} GB (${formatted})`}
      />,
    );
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "72 GB (72%)");
  });

  it("can be named with aria-label instead of a visible label", () => {
    render(<Meter aria-label="Signal strength" value={30} />);
    expect(screen.getByRole("meter", { name: "Signal strength" })).toBeInTheDocument();
  });

  it("does not render a visible label element when none is given", () => {
    render(<Meter aria-label="Signal" value={30} />);
    expect(screen.queryByText("Signal")).not.toBeInTheDocument();
  });
});
