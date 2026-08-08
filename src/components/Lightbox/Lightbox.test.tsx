import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useOverlayHandle } from "../../utils/overlayHandle";
import { Lightbox } from "./index";

const SRC = "https://example.com/cat.jpg";

describe("Lightbox", () => {
  it("keeps the image hidden until the trigger is pressed", async () => {
    const user = userEvent.setup();
    render(
      <Lightbox
        src={SRC}
        alt="A cat"
        trigger={<Lightbox.Trigger icon={<span />} aria-label="Expand" />}
      />,
    );

    expect(screen.queryByRole("img", { name: "A cat" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Expand" }));
    expect(await screen.findByRole("img", { name: "A cat" })).toHaveAttribute("src", SRC);
  });

  it("renders the trigger as a Button with the right popup wiring", () => {
    render(
      <Lightbox src={SRC} trigger={<Lightbox.Trigger icon={<span />} aria-label="Expand" />} />,
    );
    const trigger = screen.getByRole("button", { name: "Expand" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAttribute("aria-haspopup");
  });

  it("names the dialog from alt", async () => {
    const user = userEvent.setup();
    render(
      <Lightbox
        src={SRC}
        alt="A cat"
        trigger={<Lightbox.Trigger icon={<span />} aria-label="Expand" />}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Expand" }));
    expect(await screen.findByRole("dialog")).toHaveAccessibleName("A cat");
  });

  it("falls back to 'Image' as the dialog name when alt is omitted", async () => {
    const user = userEvent.setup();
    render(
      <Lightbox src={SRC} trigger={<Lightbox.Trigger icon={<span />} aria-label="Expand" />} />,
    );

    await user.click(screen.getByRole("button", { name: "Expand" }));
    expect(await screen.findByRole("dialog")).toHaveAccessibleName("Image");
  });

  it("closes via the built-in close button", async () => {
    const user = userEvent.setup();
    render(
      <Lightbox
        src={SRC}
        alt="A cat"
        trigger={<Lightbox.Trigger icon={<span />} aria-label="Expand" />}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Expand" }));
    expect(await screen.findByRole("img", { name: "A cat" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(screen.queryByRole("img", { name: "A cat" })).not.toBeInTheDocument(),
    );
  });

  it("uses closeLabel for the close button's accessible name", async () => {
    const user = userEvent.setup();
    render(
      <Lightbox
        src={SRC}
        alt="A cat"
        closeLabel="Dismiss"
        trigger={<Lightbox.Trigger icon={<span />} aria-label="Expand" />}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Expand" }));
    expect(await screen.findByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(
      <Lightbox
        src={SRC}
        alt="A cat"
        trigger={<Lightbox.Trigger icon={<span />} aria-label="Expand" />}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Expand" }));
    expect(await screen.findByRole("img", { name: "A cat" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("img", { name: "A cat" })).not.toBeInTheDocument(),
    );
  });

  it("closes when the backdrop (outside the image) is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Lightbox
        src={SRC}
        alt="A cat"
        trigger={<Lightbox.Trigger icon={<span />} aria-label="Expand" />}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Expand" }));
    const dialog = await screen.findByRole("dialog");

    // The backdrop is the dim layer rendered just before the viewport that holds
    // the popup. Clicking it is the "backdrop dismiss" a real pointer would do —
    // in jsdom there's no visual layering, so target it directly.
    const backdrop = dialog.closest("[class*='lightboxViewport']")?.previousElementSibling;
    expect(backdrop).not.toBeNull();
    await user.click(backdrop as Element);
    await waitFor(() =>
      expect(screen.queryByRole("img", { name: "A cat" })).not.toBeInTheDocument(),
    );
  });

  it("does NOT close when the image itself is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Lightbox
        src={SRC}
        alt="A cat"
        trigger={<Lightbox.Trigger icon={<span />} aria-label="Expand" />}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Expand" }));
    const image = await screen.findByRole("img", { name: "A cat" });

    await user.click(image);
    // Give any (unexpected) dismissal a chance to run before asserting it stayed.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.getByRole("img", { name: "A cat" })).toBeInTheDocument();
  });

  it("respects the controlled open state", () => {
    render(
      <Lightbox
        src={SRC}
        alt="A cat"
        open
        trigger={<Lightbox.Trigger icon={<span />} aria-label="Expand" />}
      />,
    );
    expect(screen.getByRole("img", { name: "A cat" })).toBeInTheDocument();
  });

  it("closes from a callback via useOverlayHandle, without lifting open state", async () => {
    const user = userEvent.setup();
    function Example() {
      const lightbox = useOverlayHandle(Lightbox);
      return (
        <Lightbox
          src={SRC}
          alt="A cat"
          handle={lightbox}
          trigger={<Lightbox.Trigger icon={<span />} aria-label="Expand" />}
        >
          <button type="button" onClick={() => lightbox.close()}>
            Done
          </button>
        </Lightbox>
      );
    }
    render(<Example />);

    await user.click(screen.getByRole("button", { name: "Expand" }));
    expect(await screen.findByRole("img", { name: "A cat" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() =>
      expect(screen.queryByRole("img", { name: "A cat" })).not.toBeInTheDocument(),
    );
  });
});
