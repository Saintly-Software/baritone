import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Card } from "./index";

describe("Card", () => {
  it("renders a div with its children by default", () => {
    render(<Card>Content</Card>);
    const card = screen.getByText("Content");
    expect(card.tagName).toBe("DIV");
  });

  it("renders the semantic element from the `as` prop", () => {
    render(
      <Card as="section" aria-label="panel">
        Inner
      </Card>,
    );
    const section = screen.getByLabelText("panel");
    expect(section.tagName).toBe("SECTION");
  });

  it("sets aria-disabled when disabled", () => {
    render(<Card disabled>Locked</Card>);
    expect(screen.getByText("Locked")).toHaveAttribute("aria-disabled", "true");
  });

  it("renders header and footer around the content", () => {
    render(
      <Card
        header={<Card.Header title="Title" subtitle="Subtitle" />}
        footer={<Card.Footer>Footer</Card.Footer>}
      >
        Body
      </Card>,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("lets Card.Header set the heading level", () => {
    render(<Card.Header title="Outline" level={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "Outline" })).toBeInTheDocument();
  });

  it("renders Card.Header icon and chip", () => {
    render(
      <Card.Header
        title="Production"
        icon={<span data-testid="icon">★</span>}
        chip={<span data-testid="chip">Healthy</span>}
      />,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByTestId("chip")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Production" })).toBeInTheDocument();
  });

  it("renders Card.Header as a real <header>, scoped inside a sectioning card", () => {
    render(
      <Card as="article" header={<Card.Header title="Post" />}>
        Body
      </Card>,
    );
    // The header is a real <header> nested inside the <article>, so in a browser it
    // scopes to the section rather than becoming the page `banner` landmark.
    const header = screen.getByRole("heading", { name: "Post" }).closest("header");
    expect(header).not.toBeNull();
    expect(header?.closest("article")).not.toBeNull();
  });

  it("keeps Card.Header a <div> for a plain div card (so it can't be a banner)", () => {
    const { container } = render(<Card header={<Card.Header title="Plain" />}>Body</Card>);
    // No <header> element at all — a top-level <header> would map to `banner`.
    expect(container.querySelector("header")).toBeNull();
    expect(screen.getByRole("heading", { name: "Plain" })).toBeInTheDocument();
  });

  it("renders Card.Divider as a separator", () => {
    render(<Card.Divider />);
    const divider = screen.getByRole("separator");
    expect(divider.tagName).toBe("HR");
  });

  it("renders Card.Bleed content", () => {
    render(<Card.Bleed>Bleeding</Card.Bleed>);
    expect(screen.getByText("Bleeding")).toBeInTheDocument();
  });

  it("can render as another element via the render prop", () => {
    render(
      <Card render={<section aria-label="panel2" />}>
        <span>Inner</span>
      </Card>,
    );
    const section = screen.getByLabelText("panel2");
    expect(section.tagName).toBe("SECTION");
    expect(section).toContainElement(screen.getByText("Inner"));
  });

  describe("selected", () => {
    it("is a visual state on a static card — no invalid ARIA on the container", () => {
      const { rerender } = render(<Card>Pick me</Card>);
      const card = screen.getByText("Pick me");
      // Selection is conveyed by the control inside (a checkbox); a plain
      // container can't validly carry aria-selected/aria-pressed, so it doesn't.
      expect(card).not.toHaveAttribute("aria-selected");
      expect(card).not.toHaveAttribute("aria-pressed");

      rerender(<Card selected>Pick me</Card>);
      expect(card).not.toHaveAttribute("aria-selected");
      expect(card).not.toHaveAttribute("aria-pressed");
    });

    it("announces a clickable card as a pressed toggle button when selected", () => {
      const { rerender } = render(
        <Card selected onClick={() => {}} header={<Card.Header title="Filter" />}>
          Body
        </Card>,
      );
      const button = screen.getByRole("button", { name: "Filter" });
      expect(button).toHaveAttribute("aria-pressed", "true");

      rerender(
        <Card selected={false} onClick={() => {}} header={<Card.Header title="Filter" />}>
          Body
        </Card>,
      );
      expect(button).toHaveAttribute("aria-pressed", "false");
    });

    it("leaves a plain clickable card an ordinary button (no toggle semantics)", () => {
      render(
        <Card onClick={() => {}} header={<Card.Header title="Open" />}>
          Body
        </Card>,
      );
      expect(screen.getByRole("button", { name: "Open" })).not.toHaveAttribute("aria-pressed");
    });

    it("marks a selected linkable card as the current choice", () => {
      const { rerender } = render(
        <Card selected href="/a" header={<Card.Header title="Tab A" />}>
          Body
        </Card>,
      );
      const link = screen.getByRole("link", { name: "Tab A" });
      expect(link).toHaveAttribute("aria-current", "true");

      // Unselected emits nothing (aria-current="false" is announced by some AT).
      rerender(
        <Card selected={false} href="/a" header={<Card.Header title="Tab A" />}>
          Body
        </Card>,
      );
      expect(link).not.toHaveAttribute("aria-current");
    });
  });

  describe("clickable", () => {
    it("turns the header title into a <button type=button> and fires onClick", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Card onClick={onClick} header={<Card.Header title="Press" />}>
          Body
        </Card>,
      );
      const button = screen.getByRole("button", { name: "Press" });
      expect(button).toHaveAttribute("type", "button");
      await user.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("uses aria-disabled (not native disabled), stays tabbable, and swallows the click", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Card onClick={onClick} disabled header={<Card.Header title="Press" />}>
          Body
        </Card>,
      );
      const button = screen.getByRole("button", { name: "Press" });
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toHaveAttribute("disabled");

      // Disabled but reachable: it can be tabbed to.
      await user.tab();
      expect(button).toHaveFocus();

      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("is a plain container (not a button), so nested controls stay separate", () => {
      const onClick = vi.fn();
      render(
        <Card
          onClick={onClick}
          header={<Card.Header title="Open" />}
          footer={<Card.Footer actions={<button>Dismiss</button>} />}
        >
          Body
        </Card>,
      );
      const primary = screen.getByRole("button", { name: "Open" });
      const dismiss = screen.getByRole("button", { name: "Dismiss" });
      // The card itself isn't the control, so the footer button isn't nested in it.
      expect(primary).not.toContainElement(dismiss);
      expect(screen.getByText("Body").closest("button")).toBeNull();
    });
  });

  describe("linkable", () => {
    it("turns the header title into an <a> with href/target/rel", () => {
      render(
        <Card
          href="https://example.com"
          target="_blank"
          rel="noreferrer"
          header={<Card.Header title="Visit" />}
        >
          Body
        </Card>,
      );
      const link = screen.getByRole("link", { name: "Visit" });
      expect(link).toHaveAttribute("href", "https://example.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    });

    it("nests the link inside the heading, naming the card by the title alone", () => {
      render(
        <Card href="https://example.com" header={<Card.Header title="Read the docs" />}>
          A long supporting description that should not be part of the link name.
        </Card>,
      );
      const link = screen.getByRole("link", { name: "Read the docs" });
      // The article's pattern: the link lives in the heading.
      expect(link.closest("h3")).not.toBeNull();
    });

    it("can render a router link via the render prop", () => {
      render(
        <Card
          href="/about"
          render={<a className="router" />}
          header={<Card.Header title="About" />}
        >
          Body
        </Card>,
      );
      const link = screen.getByRole("link", { name: "About" });
      expect(link).toHaveAttribute("href", "/about");
      expect(link.className).toContain("router");
    });

    it("forwards the download attribute (boolean flag and suggested filename)", () => {
      const { rerender } = render(
        <Card href="/report.pdf" download header={<Card.Header title="Report" />}>
          Body
        </Card>,
      );
      const link = screen.getByRole("link", { name: "Report" });
      // A boolean `download` renders the bare attribute (empty value).
      expect(link).toHaveAttribute("download", "");

      rerender(
        <Card href="/report.pdf" download="q3.pdf" header={<Card.Header title="Report" />}>
          Body
        </Card>,
      );
      expect(link).toHaveAttribute("download", "q3.pdf");
    });

    it("omits the download attribute when unset", () => {
      render(
        <Card href="/report.pdf" header={<Card.Header title="Report" />}>
          Body
        </Card>,
      );
      expect(screen.getByRole("link", { name: "Report" })).not.toHaveAttribute("download");
    });
  });

  describe("collapsible", () => {
    it("shows only the header when closed, and reveals the body when opened", async () => {
      const user = userEvent.setup();
      render(
        <Card collapsible header={<Card.Header title="Shipping" />}>
          Ship worldwide
        </Card>,
      );
      // Closed by default: header (the trigger) shows, body does not.
      const trigger = screen.getByRole("button", { name: /Shipping/ });
      expect(screen.queryByText("Ship worldwide")).not.toBeInTheDocument();

      await user.click(trigger);
      expect(screen.getByText("Ship worldwide")).toBeInTheDocument();
    });

    it("drives a controlled open state via onOpenChange", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <Card
          collapsible
          open={false}
          onOpenChange={onOpenChange}
          header={<Card.Header title="Details" />}
        >
          Body
        </Card>,
      );
      await user.click(screen.getByRole("button", { name: /Details/ }));
      expect(onOpenChange).toHaveBeenCalledWith(true);
      // Still controlled-closed, so the body stays hidden.
      expect(screen.queryByText("Body")).not.toBeInTheDocument();
    });

    it("toggles only via the dedicated trigger, leaving the rest of the header interactive", async () => {
      const user = userEvent.setup();
      const onHeaderAction = vi.fn();
      render(
        <Card
          collapsible
          header={
            <Card.Header title="Shipping">
              <button onClick={onHeaderAction}>Header action</button>
            </Card.Header>
          }
        >
          Ship worldwide
        </Card>,
      );
      // The header action is its own control (not part of a whole-header button):
      // using it runs its handler and does not expand the card.
      await user.click(screen.getByRole("button", { name: "Header action" }));
      expect(onHeaderAction).toHaveBeenCalledTimes(1);
      expect(screen.queryByText("Ship worldwide")).not.toBeInTheDocument();

      // Only the disclosure trigger (labelled by the title) toggles.
      await user.click(screen.getByRole("button", { name: /Shipping/ }));
      expect(screen.getByText("Ship worldwide")).toBeInTheDocument();
    });

    it("vetoes toggling when disabled but keeps the trigger tabbable", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <Card
          collapsible
          disabled
          onOpenChange={onOpenChange}
          header={<Card.Header title="Locked" />}
        >
          Body
        </Card>,
      );
      const trigger = screen.getByRole("button", { name: /Locked/ });
      expect(trigger).toHaveAttribute("aria-disabled", "true");
      expect(trigger).not.toHaveAttribute("disabled");

      await user.tab();
      expect(trigger).toHaveFocus();

      await user.click(trigger);
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.queryByText("Body")).not.toBeInTheDocument();
    });
  });

  describe("Card.Layout", () => {
    it("renders a title heading, subtitle, and trailing action without a <dl>", () => {
      const { container } = render(
        <Card as="article">
          <Card.Layout
            title="Two-factor authentication"
            subtitle="Add an extra layer of security."
            action={<button>Enable</button>}
          />
        </Card>,
      );
      expect(
        screen.getByRole("heading", { level: 3, name: "Two-factor authentication" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Add an extra layer of security.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Enable" })).toBeInTheDocument();
      // Unlike a rich Card.Row, this isn't a description list.
      expect(container.querySelector("dl")).toBeNull();
    });

    it("supports a description-only layout — no title means no heading", () => {
      render(
        <Card>
          <Card.Layout subtitle="You're using 8.2 GB of 10 GB." action={<button>Upgrade</button>} />
        </Card>,
      );
      expect(screen.queryByRole("heading")).toBeNull();
      expect(screen.getByText("You're using 8.2 GB of 10 GB.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Upgrade" })).toBeInTheDocument();
    });

    it("honors a custom heading level", () => {
      render(
        <Card>
          <Card.Layout title="Section" level={2} />
        </Card>,
      );
      expect(screen.getByRole("heading", { level: 2, name: "Section" })).toBeInTheDocument();
    });
  });

  describe("Card.Actions", () => {
    it("renders the buttons and anchors to the given side", () => {
      const { rerender, container } = render(
        <Card.Actions actions={[<button key="a">A</button>, <button key="b">B</button>]} />,
      );
      expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "B" })).toBeInTheDocument();
      const endClass = (container.firstChild as HTMLElement).className;

      rerender(<Card.Actions side="start" actions={[<button key="a">A</button>]} />);
      const startClass = (container.firstChild as HTMLElement).className;
      expect(startClass).not.toEqual(endClass);
    });
  });

  describe("Card.Footer actions", () => {
    it("renders the actions node", () => {
      render(<Card.Footer actions={<button>Save</button>} />);
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });
  });

  describe("Card.Rows / Card.Row", () => {
    it("renders a description list of term/value rows", () => {
      const { container } = render(
        <Card.Rows
          rows={[
            <Card.Row term="Plan" description="Pro" />,
            <Card.Row term="Seats" description="12" />,
          ]}
        />,
      );
      expect(container.querySelector("dl")).toBeInTheDocument();
      const terms = container.querySelectorAll("dt");
      const descriptions = container.querySelectorAll("dd");
      expect(terms).toHaveLength(2);
      expect(descriptions).toHaveLength(2);
      expect(terms[0]).toHaveTextContent("Plan");
      expect(descriptions[0]).toHaveTextContent("Pro");
    });

    it("makes a plain term/value row hoverable but not a row with an action", () => {
      const { container } = render(
        <Card.Rows
          rows={[
            <Card.Row term="Plan" description="Pro" />,
            <Card.Row title="Payment method" subtitle="Visa" actions={<button>Update</button>} />,
          ]}
        />,
      );
      const rows = container.querySelectorAll("dl > div");
      // The plain row highlights on hover; the action row opts out — different recipe.
      expect((rows[0] as HTMLElement).className).not.toEqual((rows[1] as HTMLElement).className);
    });

    it("renders a rich row with a title/subtitle and actions", () => {
      const { container } = render(
        <Card.Rows
          rows={[
            <Card.Row
              title="Payment method"
              subtitle="Visa ending 4242"
              actions={<button>Update</button>}
            />,
          ]}
        />,
      );
      const dt = container.querySelector("dt");
      expect(dt).toHaveTextContent("Payment method");
      expect(dt).toHaveTextContent("Visa ending 4242");
      expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
    });
  });

  describe("string header shorthand", () => {
    it("renders a string header as a styled heading (level 3 by default)", () => {
      render(<Card header="Two-factor authentication" />);
      expect(
        screen.getByRole("heading", { level: 3, name: "Two-factor authentication" }),
      ).toBeInTheDocument();
    });

    it("uses the `level` prop for the string header's title", () => {
      render(<Card header="Section" level={2} />);
      expect(screen.getByRole("heading", { level: 2, name: "Section" })).toBeInTheDocument();
    });

    it("renders subheader (caption), description (body), and action for a string header", () => {
      render(
        <Card
          header="Connected apps"
          subheader="3 apps have access"
          description="Manage which apps can see your data."
          action={<button>Review</button>}
        />,
      );
      expect(screen.getByRole("heading", { name: "Connected apps" })).toBeInTheDocument();
      expect(screen.getByText("3 apps have access")).toBeInTheDocument();
      expect(screen.getByText("Manage which apps can see your data.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Review" })).toBeInTheDocument();
    });

    it("needs no children — header + description alone render a complete card", () => {
      render(<Card header="Storage" description="8.2 GB of 10 GB used." />);
      expect(screen.getByRole("heading", { name: "Storage" })).toBeInTheDocument();
      expect(screen.getByText("8.2 GB of 10 GB used.")).toBeInTheDocument();
    });

    it("turns a clickable card's string header title into the overlay button", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<Card onClick={onClick} header="Press me" />);
      const button = screen.getByRole("button", { name: "Press me" });
      expect(button.tagName).toBe("BUTTON");
      await user.click(button);
      expect(onClick).toHaveBeenCalledOnce();
    });

    it("still renders a description alongside a Card.Header element", () => {
      render(<Card header={<Card.Header title="Element header" />} description="Body copy." />);
      expect(screen.getByRole("heading", { name: "Element header" })).toBeInTheDocument();
      expect(screen.getByText("Body copy.")).toBeInTheDocument();
    });
  });
});
