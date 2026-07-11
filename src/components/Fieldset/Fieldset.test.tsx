import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { Checkbox } from "../Checkbox";
import { Switch } from "../Switch";
import { TextInput } from "../TextInput";
import { Fieldset, FieldsetLegend, useIsFieldDisabled } from "./index";

describe("Fieldset", () => {
  it("renders a group named by its legend", () => {
    render(
      <Fieldset>
        <FieldsetLegend>Shipping address</FieldsetLegend>
        <TextInput label="Street" />
      </Fieldset>,
    );
    expect(screen.getByRole("group", { name: "Shipping address" })).toBeInTheDocument();
  });

  it("can be named by aria-labelledby instead of a legend", () => {
    render(
      <>
        <h3 id="prefs">Preferences</h3>
        <Fieldset aria-labelledby="prefs">
          <Switch label="Dark mode" value onChange={() => {}} />
        </Fieldset>
      </>,
    );
    expect(screen.getByRole("group", { name: "Preferences" })).toBeInTheDocument();
  });

  it("leaves nested controls enabled when the fieldset is enabled", () => {
    render(
      <Fieldset>
        <TextInput label="Street" />
        <Switch label="SMS" value={false} onChange={() => {}} />
      </Fieldset>,
    );
    expect(screen.getByRole("textbox", { name: "Street" })).not.toHaveAttribute("aria-disabled");
    expect(screen.getByRole("switch", { name: "SMS" })).not.toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("disables every nested control when the fieldset is disabled", () => {
    render(
      <Fieldset disabled>
        <TextInput label="Street" />
        <Switch label="SMS" value={false} onChange={() => {}} />
        <Checkbox label="Save" value={false} onChange={() => {}} />
      </Fieldset>,
    );
    expect(screen.getByRole("textbox", { name: "Street" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("switch", { name: "SMS" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("checkbox", { name: "Save" })).toHaveAttribute("aria-disabled", "true");
  });

  it("uses aria-disabled (not the native attribute), so nested controls stay tabbable", async () => {
    const user = userEvent.setup();
    render(
      <Fieldset disabled>
        <TextInput label="Street" />
      </Fieldset>,
    );
    const input = screen.getByRole("textbox", { name: "Street" });
    // The native attribute would drop the field out of the tab order.
    expect(input).not.toBeDisabled();

    await user.tab();
    expect(input).toHaveFocus();
  });

  it("blocks interaction with a control disabled purely by the fieldset", async () => {
    const user = userEvent.setup();
    function Host() {
      const [on, setOn] = React.useState(false);
      return (
        <Fieldset disabled>
          <Switch label="SMS" value={on} onChange={setOn} />
        </Fieldset>
      );
    }
    render(<Host />);
    const toggle = screen.getByRole("switch", { name: "SMS" });

    await user.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it("keeps a control disabled if it opts in itself, even when the fieldset is enabled", () => {
    render(
      <Fieldset>
        <TextInput label="Street" disabled />
        <TextInput label="City" />
      </Fieldset>,
    );
    expect(screen.getByRole("textbox", { name: "Street" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("textbox", { name: "City" })).not.toHaveAttribute("aria-disabled");
  });

  it("composes when nested: an inner, not-disabled fieldset can't undo an outer disable", () => {
    render(
      <Fieldset disabled>
        <TextInput label="Email" />
        <Fieldset>
          <TextInput label="Nickname" />
        </Fieldset>
      </Fieldset>,
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute("aria-disabled", "true");
    // Inner fieldset isn't itself disabled, but it inherits the outer's disable.
    expect(screen.getByRole("textbox", { name: "Nickname" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("dims the legend when the fieldset is disabled", () => {
    const { rerender } = render(
      <Fieldset>
        <FieldsetLegend>Group</FieldsetLegend>
      </Fieldset>,
    );
    const legend = screen.getByText("Group");
    const enabledClass = legend.className;

    rerender(
      <Fieldset disabled>
        <FieldsetLegend>Group</FieldsetLegend>
      </Fieldset>,
    );
    // The disabled variant adds an extra class (the 0.55 opacity fade).
    expect(screen.getByText("Group").className).not.toEqual(enabledClass);
  });
});

describe("useIsFieldDisabled", () => {
  function Probe() {
    return <span data-testid="probe">{String(useIsFieldDisabled())}</span>;
  }

  it("returns false with no enclosing Fieldset", () => {
    render(<Probe />);
    expect(screen.getByTestId("probe")).toHaveTextContent("false");
  });

  it("reflects the enclosing Fieldset's disabled state", () => {
    render(
      <Fieldset disabled>
        <Probe />
      </Fieldset>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("true");
  });
});
