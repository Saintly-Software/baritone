import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, type Mock, vi } from "vitest";
import { type FileInfo } from "../FileList";
import { FileUpload, matchesAccept } from "./index";

/** The underlying file `<input>` (it's visually hidden, so query it directly). */
function getInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector('input[type="file"]');
  if (input == null) throw new Error("file input not found");
  return input as HTMLInputElement;
}

/** The dropzone is the input's parent; drag/drop handlers live on it. */
function getZone(container: HTMLElement): HTMLElement {
  const zone = getInput(container).parentElement;
  if (zone == null) throw new Error("dropzone not found");
  return zone;
}

/** The first argument of the most recent call to a mocked `onChange`. */
function lastArg<T>(mock: Mock): T {
  const last = mock.mock.calls.at(-1);
  if (last == null) throw new Error("onChange was not called");
  return last[0] as T;
}

/** A minimal DataTransfer-ish payload for fireEvent drag/drop events. */
function dragData(files: File[]) {
  return {
    dataTransfer: {
      files,
      items: files.map((file) => ({ kind: "file", type: file.type, getAsFile: () => file })),
      types: ["Files"],
    },
  };
}

describe("FileUpload", () => {
  it("renders a file input named by the label", () => {
    render(<FileUpload label="Attachments" value={null} onChange={() => {}} />);
    const input = screen.getByLabelText("Attachments");
    expect(input).toHaveAttribute("type", "file");
  });

  it("forwards accept, multiple and required to the input", () => {
    const { container } = render(
      <FileUpload
        label="Files"
        multiple
        required
        acceptedFileTypes={["image/*", ".pdf"]}
        value={[]}
        onChange={() => {}}
      />,
    );
    const input = getInput(container);
    expect(input).toHaveAttribute("multiple");
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("accept", "image/*,.pdf");
  });

  it("omits multiple on a single upload", () => {
    const { container } = render(<FileUpload label="Avatar" value={null} onChange={() => {}} />);
    expect(getInput(container)).not.toHaveAttribute("multiple");
  });

  describe("selection", () => {
    it("calls onChange with a FileInfo when a file is selected (single)", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      const { container } = render(<FileUpload label="Avatar" value={null} onChange={onChange} />);

      const file = new File(["x"], "me.png", { type: "image/png" });
      await user.upload(getInput(container), file);

      expect(onChange).toHaveBeenCalledTimes(1);
      const arg = lastArg<FileInfo>(onChange);
      expect(arg.file).toBe(file);
      expect(typeof arg.id).toBe("string");
    });

    it("appends to the existing value when multiple", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      const existing: FileInfo[] = [{ id: "a", file: new File([], "a.pdf") }];
      const { container } = render(
        <FileUpload label="Files" multiple value={existing} onChange={onChange} />,
      );

      const file = new File([], "b.pdf");
      await user.upload(getInput(container), file);

      const next = lastArg<FileInfo[]>(onChange);
      expect(next).toHaveLength(2);
      expect(next.at(0)).toBe(existing.at(0));
      expect(next.at(1)?.file).toBe(file);
    });

    it("replaces the staged file when single", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      const existing: FileInfo = { id: "a", file: new File([], "old.png", { type: "image/png" }) };
      const { container } = render(
        <FileUpload label="Avatar" value={existing} onChange={onChange} />,
      );

      const file = new File([], "new.png", { type: "image/png" });
      await user.upload(getInput(container), file);

      const arg = lastArg<FileInfo | null>(onChange);
      expect(arg?.file).toBe(file);
    });
  });

  describe("drag and drop", () => {
    it("stages dropped files", () => {
      const onChange = vi.fn();
      const { container } = render(
        <FileUpload label="Files" multiple value={[]} onChange={onChange} />,
      );

      const file = new File([], "dropped.png", { type: "image/png" });
      fireEvent.drop(getZone(container), dragData([file]));

      const next = lastArg<FileInfo[]>(onChange);
      expect(next).toHaveLength(1);
      expect(next.at(0)?.file).toBe(file);
    });

    it("flags data-dragging while a drag is over the zone", () => {
      const { container } = render(
        <FileUpload label="Files" multiple value={[]} onChange={() => {}} />,
      );
      const zone = getZone(container);

      expect(zone).not.toHaveAttribute("data-dragging");
      fireEvent.dragEnter(zone, dragData([]));
      expect(zone).toHaveAttribute("data-dragging", "true");
      fireEvent.dragLeave(zone, dragData([]));
      expect(zone).not.toHaveAttribute("data-dragging");
    });

    it("ignores dropped files that don't match acceptedFileTypes", () => {
      const onChange = vi.fn();
      const { container } = render(
        <FileUpload
          label="Images"
          multiple
          acceptedFileTypes={["image/*"]}
          value={[]}
          onChange={onChange}
        />,
      );
      const zone = getZone(container);

      fireEvent.drop(zone, dragData([new File([], "notes.txt", { type: "text/plain" })]));
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.drop(zone, dragData([new File([], "pic.png", { type: "image/png" })]));
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("keeps only the first dropped file when single", () => {
      const onChange = vi.fn();
      const { container } = render(<FileUpload label="Avatar" value={null} onChange={onChange} />);

      const first = new File([], "first.png", { type: "image/png" });
      const second = new File([], "second.png", { type: "image/png" });
      fireEvent.drop(getZone(container), dragData([first, second]));

      const arg = lastArg<FileInfo | null>(onChange);
      expect(arg?.file).toBe(first);
    });
  });

  describe("staged FileList", () => {
    it("renders staged files and removes one on its × (multiple)", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      const value: FileInfo[] = [
        { id: "a", file: new File([], "a.pdf") },
        { id: "b", file: new File([], "b.png") },
      ];
      render(<FileUpload label="Files" multiple value={value} onChange={onChange} />);

      expect(screen.getByText("a.pdf")).toBeInTheDocument();
      expect(screen.getByText("b.png")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Remove a.pdf" }));
      expect(onChange).toHaveBeenCalledExactlyOnceWith([value.at(1)]);
    });

    it("emits null when the single staged file is removed", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      const value: FileInfo = { id: "a", file: new File([], "a.pdf") };
      render(<FileUpload label="Avatar" value={value} onChange={onChange} />);

      await user.click(screen.getByRole("button", { name: "Remove a.pdf" }));
      expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
    });

    it("renders no FileList when empty", () => {
      render(<FileUpload label="Files" multiple value={[]} onChange={() => {}} />);
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  describe("disabled", () => {
    it("marks the input aria-disabled (not the native attribute) and keeps it focusable", () => {
      const { container } = render(
        <FileUpload label="Files" disabled multiple value={[]} onChange={() => {}} />,
      );
      const input = getInput(container);
      expect(input).toHaveAttribute("aria-disabled", "true");
      expect(input).not.toHaveAttribute("disabled");

      input.focus();
      expect(input).toHaveFocus();
    });

    it("cancels the click so the picker can't open", () => {
      const { container } = render(
        <FileUpload label="Files" disabled value={null} onChange={() => {}} />,
      );
      // fireEvent returns false when a handler called preventDefault.
      expect(fireEvent.click(getInput(container))).toBe(false);
    });

    it("does not open the picker when enabled is the default (click not cancelled)", () => {
      const { container } = render(<FileUpload label="Files" value={null} onChange={() => {}} />);
      expect(fireEvent.click(getInput(container))).toBe(true);
    });

    it("ignores drops and shows no drag state", () => {
      const onChange = vi.fn();
      const { container } = render(
        <FileUpload label="Files" disabled multiple value={[]} onChange={onChange} />,
      );
      const zone = getZone(container);

      fireEvent.dragEnter(zone, dragData([new File([], "x.png", { type: "image/png" })]));
      expect(zone).not.toHaveAttribute("data-dragging");

      fireEvent.drop(zone, dragData([new File([], "x.png", { type: "image/png" })]));
      expect(onChange).not.toHaveBeenCalled();
    });

    it("renders staged files inert: remove buttons are aria-disabled and don't fire", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      const value: FileInfo[] = [{ id: "a", file: new File([], "a.pdf") }];
      render(<FileUpload label="Files" disabled multiple value={value} onChange={onChange} />);

      const remove = screen.getByRole("button", { name: "Remove a.pdf" });
      expect(remove).toHaveAttribute("aria-disabled", "true");
      expect(remove).not.toHaveAttribute("disabled");

      await user.click(remove);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("validation / naming", () => {
    it("wires helpText as the input's accessible description", () => {
      const { container } = render(
        <FileUpload
          label="Files"
          helpText="PNG or JPG, up to 5MB"
          value={null}
          onChange={() => {}}
        />,
      );
      expect(screen.getByText("PNG or JPG, up to 5MB")).toBeInTheDocument();
      expect(getInput(container)).toHaveAccessibleDescription("PNG or JPG, up to 5MB");
    });

    it("sets aria-invalid on the input when invalid", () => {
      const { container } = render(
        <FileUpload label="Files" invalid value={null} onChange={() => {}} />,
      );
      expect(getInput(container)).toHaveAttribute("aria-invalid", "true");
    });

    it("is not aria-invalid by default", () => {
      const { container } = render(<FileUpload label="Files" value={null} onChange={() => {}} />);
      expect(getInput(container)).not.toHaveAttribute("aria-invalid", "true");
    });

    it("supports aria-labelledby for an external label", () => {
      render(
        <>
          <span id="lbl">Upload resume</span>
          <FileUpload aria-labelledby="lbl" value={null} onChange={() => {}} />
        </>,
      );
      expect(screen.getByLabelText("Upload resume")).toHaveAttribute("type", "file");
    });

    it("supports a plain aria-label", () => {
      const { container } = render(
        <FileUpload aria-label="Documents" value={null} onChange={() => {}} />,
      );
      expect(getInput(container)).toHaveAccessibleName("Documents");
    });
  });
});

describe("matchesAccept", () => {
  it("accepts everything when the list is empty or absent", () => {
    expect(matchesAccept(new File([], "x.exe"))).toBe(true);
    expect(matchesAccept(new File([], "x.exe"), [])).toBe(true);
  });

  it("matches by extension, case-insensitively", () => {
    expect(matchesAccept(new File([], "doc.PDF"), [".pdf"])).toBe(true);
    expect(matchesAccept(new File([], "doc.txt"), [".pdf"])).toBe(false);
  });

  it("matches by wildcard MIME", () => {
    expect(matchesAccept(new File([], "x", { type: "image/png" }), ["image/*"])).toBe(true);
    expect(matchesAccept(new File([], "x", { type: "video/mp4" }), ["image/*"])).toBe(false);
  });

  it("matches by exact MIME", () => {
    expect(matchesAccept(new File([], "x", { type: "application/pdf" }), ["application/pdf"])).toBe(
      true,
    );
    expect(matchesAccept(new File([], "x", { type: "image/png" }), ["application/pdf"])).toBe(
      false,
    );
  });

  it("matches if any token in the list matches", () => {
    const file = new File([], "sheet.csv", { type: "text/csv" });
    expect(matchesAccept(file, ["image/*", ".csv"])).toBe(true);
  });
});
