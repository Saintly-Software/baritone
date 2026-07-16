import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TextInput } from "./index";

describe("TextInput", () => {
  it("associates its label with the input", () => {
    render(<TextInput label="Email" placeholder="you@example.com" />);
    const input = screen.getByLabelText("Email");
    expect(input.tagName).toBe("INPUT");
  });

  it("uses aria-disabled + readOnly rather than the disabled attribute", () => {
    render(<TextInput label="Name" disabled />);
    const input = screen.getByLabelText("Name");
    expect(input).toHaveAttribute("aria-disabled", "true");
    expect(input).toHaveAttribute("readonly");
    expect(input).not.toBeDisabled();
  });

  it("shows the error message and marks the field invalid in the invalid state", () => {
    render(<TextInput label="Age" state="invalid" errorMessage="Must be a number" />);
    expect(screen.getByText("Must be a number")).toBeInTheDocument();
    expect(screen.getByLabelText("Age")).toHaveAttribute("aria-invalid", "true");
  });

  it("does not render an error message outside the invalid state", () => {
    render(<TextInput label="Age" state="warning" errorMessage="Hidden" />);
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  describe("multiline", () => {
    it("renders a textarea with the requested rows, still label-associated", () => {
      render(<TextInput multiline rows={5} label="Notes" />);
      const control = screen.getByLabelText("Notes");
      expect(control.tagName).toBe("TEXTAREA");
      expect(control).toHaveAttribute("rows", "5");
    });

    it("defaults to 3 rows", () => {
      render(<TextInput multiline label="Notes" />);
      expect(screen.getByLabelText("Notes")).toHaveAttribute("rows", "3");
    });

    it("keeps the aria-disabled + readOnly disabled model", () => {
      render(<TextInput multiline label="Notes" disabled />);
      const control = screen.getByLabelText("Notes");
      expect(control).toHaveAttribute("aria-disabled", "true");
      expect(control).toHaveAttribute("readonly");
      expect(control).not.toBeDisabled();
    });
  });

  describe("info", () => {
    it("renders an InfoButton next to the label and opens a popover on click", async () => {
      const user = userEvent.setup();
      render(
        <TextInput
          label="API key"
          info="Find it in Settings."
          slotProps={{ info: { "aria-label": "About API keys" } }}
        />,
      );
      const trigger = screen.getByRole("button", { name: "About API keys" });
      // The label still names the input (info sits beside it, not inside it).
      expect(screen.getByLabelText("API key").tagName).toBe("INPUT");

      expect(screen.queryByText("Find it in Settings.")).not.toBeInTheDocument();
      await user.click(trigger);
      expect(screen.getByText("Find it in Settings.")).toBeInTheDocument();
    });

    it("does not render the InfoButton when there is no label", () => {
      render(<TextInput aria-label="Bare" info="Hidden info" />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("slotProps", () => {
    it("merges a slot className onto the built-in label class", () => {
      render(<TextInput label="Email" slotProps={{ label: { className: "custom-label" } }} />);
      expect(screen.getByText("Email")).toHaveClass("custom-label");
    });

    it("merges a slot className onto the built-in help text class", () => {
      render(
        <TextInput
          label="Email"
          helpText="Help"
          slotProps={{ helpText: { className: "custom-desc" } }}
        />,
      );
      const desc = screen.getByText("Help");
      expect(desc).toHaveClass("custom-desc");
      // The built-in help text class is still present (merged, not replaced).
      expect(desc.className).not.toBe("custom-desc");
    });
  });
});
