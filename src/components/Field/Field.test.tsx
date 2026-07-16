import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Fieldset } from "../Fieldset";
import { Field } from "./index";

/** Resolve an element's `aria-describedby` to the text it actually announces. */
function describedByText(el: HTMLElement): string[] {
  const ids = (el.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
  return ids.map((id) => document.getElementById(id)?.textContent ?? `<missing:${id}>`);
}

describe("Field", () => {
  describe("labelling", () => {
    it("associates a visible label with the control", () => {
      render(
        <Field label="Email">
          <Field.Control />
        </Field>,
      );
      expect(screen.getByLabelText("Email").tagName).toBe("INPUT");
    });

    it("names the control with aria-label when there is no visible label", () => {
      render(
        <Field aria-label="Search">
          <Field.Control {...{ "aria-label": "Search" }} />
        </Field>,
      );
      expect(screen.getByLabelText("Search").tagName).toBe("INPUT");
    });

    it("warns when label and aria-label are both passed", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(
        // @ts-expect-error — mutually exclusive: the union rejects this at compile time.
        <Field label="Email" aria-label="Email address">
          {null}
        </Field>,
      );
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("mutually exclusive"));
      warn.mockRestore();
    });

    it("warns when label and aria-labelledby are both passed", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(
        // @ts-expect-error — mutually exclusive: the union rejects this at compile time.
        <Field label="Email" aria-labelledby="other">
          {null}
        </Field>,
      );
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("mutually exclusive"));
      warn.mockRestore();
    });

    it("does not warn when exactly one naming prop is passed", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(
        <Field label="Email">
          <Field.Control />
        </Field>,
      );
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  describe("helpText", () => {
    it("wires helpText to the control's aria-describedby", () => {
      render(
        <Field label="Email" helpText="We'll never share it.">
          <Field.Control />
        </Field>,
      );
      expect(describedByText(screen.getByLabelText("Email"))).toEqual(["We'll never share it."]);
    });

    it("combines helpText with a caller's aria-describedby rather than replacing it", () => {
      render(
        <>
          <span id="ext">From elsewhere</span>
          <Field label="Email" helpText="Inline help">
            <Field.Control aria-describedby="ext" />
          </Field>
        </>,
      );
      expect(describedByText(screen.getByLabelText("Email"))).toEqual([
        "From elsewhere",
        "Inline help",
      ]);
    });

    it("renders helpText as a HelpText", () => {
      render(
        <Field label="Email" helpText="Help me">
          <Field.Control />
        </Field>,
      );
      // HelpText composes Text, which renders a <p> by default.
      expect(screen.getByText("Help me").tagName).toBe("P");
    });

    it("applies slotProps.helpText to the help text", () => {
      render(
        <Field label="Email" helpText="Help me" slotProps={{ helpText: { className: "custom" } }}>
          <Field.Control />
        </Field>,
      );
      const help = screen.getByText("Help me");
      expect(help).toHaveClass("custom");
      // Merged onto the built-in class, not replacing it.
      expect(help.className).not.toBe("custom");
    });
  });

  describe("validation", () => {
    it("announces both helpText and errorMessage when invalid", () => {
      render(
        <Field label="Age" helpText="Your age" state="invalid" errorMessage="Must be a number">
          <Field.Control />
        </Field>,
      );
      const input = screen.getByLabelText("Age");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(describedByText(input)).toEqual(["Your age", "Must be a number"]);
    });

    it("does not render the error message outside the invalid state", () => {
      render(
        <Field label="Age" state="warning" errorMessage="Hidden">
          <Field.Control />
        </Field>,
      );
      expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
    });
  });

  describe("slotProps.label", () => {
    it("merges a slot className onto the built-in label class", () => {
      render(
        <Field label="Email" slotProps={{ label: { className: "custom-label" } }}>
          <Field.Control />
        </Field>,
      );
      const label = screen.getByText("Email");
      expect(label).toHaveClass("custom-label");
      expect(label.className).not.toBe("custom-label");
    });
  });

  describe("disabled", () => {
    it("never puts the native disabled attribute on the control", () => {
      render(
        <Field label="Email" disabled>
          <Field.Control />
        </Field>,
      );
      expect(screen.getByLabelText("Email")).not.toBeDisabled();
    });

    it("dims the label when an enclosing Fieldset is disabled", () => {
      render(
        <Fieldset disabled>
          <Field label="Email">
            <Field.Control />
          </Field>
        </Fieldset>,
      );
      // The disabled class is merged on top of the base label class.
      expect(screen.getByText("Email").className.split(" ").length).toBeGreaterThan(1);
    });
  });

  describe("id", () => {
    it("points the label at an explicit control id", () => {
      const { container } = render(
        <Field label="Email" helpText="Help">
          <Field.Control id="email" />
        </Field>,
      );
      const input = screen.getByLabelText("Email");
      expect(input).toHaveAttribute("id", "email");
      expect(container.querySelector("label")).toHaveAttribute("for", "email");
      // The help wiring still resolves alongside the caller-chosen id.
      expect(describedByText(input)).toEqual(["Help"]);
    });
  });

  describe("info", () => {
    it("renders an InfoButton beside the label without joining the accessible name", async () => {
      const user = userEvent.setup();
      render(
        <Field
          label="API key"
          info="Find it in Settings."
          slotProps={{ info: { "aria-label": "About API keys" } }}
        >
          <Field.Control />
        </Field>,
      );
      // The label still names the input on its own — the button sits beside it.
      expect(screen.getByLabelText("API key").tagName).toBe("INPUT");

      const trigger = screen.getByRole("button", { name: "About API keys" });
      expect(screen.queryByText("Find it in Settings.")).not.toBeInTheDocument();
      await user.click(trigger);
      expect(screen.getByText("Find it in Settings.")).toBeInTheDocument();
    });

    it("does not render the InfoButton when there is no visible label", () => {
      render(
        <Field aria-label="Bare" info="Hidden info">
          <Field.Control {...{ "aria-label": "Bare" }} />
        </Field>,
      );
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });
});
