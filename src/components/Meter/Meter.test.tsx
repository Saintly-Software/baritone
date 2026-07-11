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

  it("renders a description and wires it up as aria-describedby", () => {
    render(<Meter label="Storage" value={72} description="of your 100 GB quota" />);
    const meter = screen.getByRole("meter");
    const description = screen.getByText("of your 100 GB quota");
    expect(description).toBeInTheDocument();
    expect(meter).toHaveAttribute("aria-describedby", description.id);
    expect(description.id).toBeTruthy();
  });

  it("does not set aria-describedby when there's no description", () => {
    render(<Meter label="Storage" value={72} />);
    expect(screen.getByRole("meter")).not.toHaveAttribute("aria-describedby");
  });

  it("shows the formatted value only when showValue is set", () => {
    const { rerender } = render(<Meter label="Storage" value={72} />);
    expect(screen.queryByText("72%")).not.toBeInTheDocument();
    rerender(<Meter label="Storage" value={72} showValue />);
    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("formats the displayed value with format / locale", () => {
    render(
      <Meter
        label="Download"
        value={4.2}
        min={0}
        max={10}
        showValue
        format={{ style: "unit", unit: "gigabyte", unitDisplay: "short" }}
      />,
    );
    // Intl renders "4.2 GB" (narrow no-break space between number and unit).
    expect(screen.getByText(/4\.2\s*GB/)).toBeInTheDocument();
  });

  it("lets formatValue take over the displayed node", () => {
    render(
      <Meter
        label="Seats"
        value={18}
        max={25}
        showValue
        formatValue={(_formatted, value) => `${value} / 25`}
      />,
    );
    expect(screen.getByText("18 / 25")).toBeInTheDocument();
  });

  it("keeps the displayed value out of the accessibility tree", () => {
    render(<Meter label="Storage" value={72} showValue />);
    // The read-out is aria-hidden; the value reaches AT via aria-valuenow /
    // aria-valuetext, so the meter's name stays just its label.
    expect(screen.getByRole("meter", { name: "Storage" })).toBeInTheDocument();
  });

  it("forwards slotProps onto the label / value / description slots", () => {
    render(
      <Meter
        label="Storage"
        value={72}
        showValue
        description="quota"
        slotProps={{
          label: { className: "slot-label" },
          value: { className: "slot-value" },
          description: { className: "slot-description" },
        }}
      />,
    );
    expect(screen.getByText("Storage")).toHaveClass("slot-label");
    expect(screen.getByText("72%")).toHaveClass("slot-value");
    expect(screen.getByText("quota")).toHaveClass("slot-description");
  });
});
