import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { ToggleButton } from "./index";

// A throwaway glyph so the button has content to render.
const Star = () => (
  <svg data-testid="star" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2l2.4 6.5L21 11l-6.6 2.5L12 20l-2.4-6.5L3 11l6.6-2.5z" />
  </svg>
);

// A tiny controlled host mirroring the documented usage, so the tests exercise
// the component exactly as a consumer would wire it.
function Favourite({
  value: initial = false,
  onChange,
  ...rest
}: {
  value?: boolean;
  onChange?: (value: boolean) => void;
} & Partial<React.ComponentProps<typeof ToggleButton>>) {
  const [value, setValue] = React.useState(initial);
  return (
    <ToggleButton
      aria-label="Favourite"
      icon={<Star />}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      {...rest}
    />
  );
}

describe("ToggleButton", () => {
  it("renders an icon-only button named by its aria-label", () => {
    render(<Favourite />);
    const button = screen.getByRole("button", { name: "Favourite" });
    expect(button.tagName).toBe("BUTTON");
    expect(screen.getByTestId("star")).toBeInTheDocument();
  });

  it("is not pressed when value is false", () => {
    render(<Favourite />);
    expect(screen.getByRole("button", { name: "Favourite" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("reflects the controlled value as pressed", () => {
    render(<Favourite value />);
    // `pressed: true` matches aria-pressed="true".
    expect(screen.getByRole("button", { name: "Favourite", pressed: true })).toBeInTheDocument();
  });

  it("calls onChange with the negated value and flips pressed on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Favourite onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Favourite" }));

    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Favourite" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("toggles back off when pressed again", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Favourite value onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Favourite" }));

    expect(onChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("button", { name: "Favourite" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  describe("disabled", () => {
    it("uses aria-disabled (not the disabled attribute) and stays focusable", () => {
      render(<Favourite disabled />);
      const button = screen.getByRole("button", { name: "Favourite" });
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toHaveAttribute("disabled");

      button.focus();
      expect(button).toHaveFocus();
    });

    it("does not toggle when disabled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Favourite disabled onChange={onChange} />);

      await user.click(screen.getByRole("button", { name: "Favourite" }));

      expect(onChange).not.toHaveBeenCalled();
      // State is unchanged — still reports its (off) pressed state to AT.
      expect(screen.getByRole("button", { name: "Favourite" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });
  });
});
