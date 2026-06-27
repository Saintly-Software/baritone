import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileList, type FileInfo } from "./index";
import { fileKind } from "./fileTypeIcon";

const files: FileInfo[] = [
  { id: "a", file: new File([], "report.pdf") },
  { id: "b", file: new File([], "logo.svg") },
];

describe("FileList", () => {
  it("renders one chip per item inside a list", () => {
    render(<FileList items={files} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(screen.getByText("logo.svg")).toBeInTheDocument();
  });

  it("renders a decorative file-type icon in each chip", () => {
    render(<FileList items={files} />);
    for (const item of screen.getAllByRole("listitem")) {
      const icon = item.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("renders no remove buttons when onRemove is omitted", () => {
    render(<FileList items={files} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders a labelled remove button per item when onRemove is provided", () => {
    render(<FileList items={files} onRemove={() => {}} />);
    expect(screen.getByRole("button", { name: "Remove report.pdf" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove logo.svg" })).toBeInTheDocument();
  });

  it("calls onRemove with the file id when a remove button is clicked", async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(<FileList items={files} onRemove={onRemove} />);

    await user.click(screen.getByRole("button", { name: "Remove logo.svg" }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith("b");
  });

  describe("disabled", () => {
    it("marks the remove button aria-disabled (not the native attribute) and keeps it focusable", () => {
      render(<FileList items={files} disabled onRemove={() => {}} />);
      const button = screen.getByRole("button", { name: "Remove report.pdf" });
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toHaveAttribute("disabled");

      button.focus();
      expect(button).toHaveFocus();
    });

    it("does not call onRemove when disabled", async () => {
      const onRemove = vi.fn();
      const user = userEvent.setup();
      render(<FileList items={files} disabled onRemove={onRemove} />);

      await user.click(screen.getByRole("button", { name: "Remove report.pdf" }));
      expect(onRemove).not.toHaveBeenCalled();
    });
  });

  describe("fileKind", () => {
    it("classifies by MIME type when present", () => {
      expect(fileKind(new File([], "x", { type: "image/png" }))).toBe("image");
      expect(fileKind(new File([], "x", { type: "audio/mpeg" }))).toBe("audio");
      expect(fileKind(new File([], "x", { type: "video/mp4" }))).toBe("video");
      expect(fileKind(new File([], "x", { type: "application/pdf" }))).toBe("pdf");
    });

    it("falls back to the filename extension when the type is empty", () => {
      expect(fileKind(new File([], "a.png"))).toBe("image");
      expect(fileKind(new File([], "a.mp3"))).toBe("audio");
      expect(fileKind(new File([], "report.pdf"))).toBe("pdf");
      expect(fileKind(new File([], "sheet.CSV"))).toBe("spreadsheet");
      expect(fileKind(new File([], "backup.zip"))).toBe("archive");
      expect(fileKind(new File([], "notes.docx"))).toBe("document");
      expect(fileKind(new File([], "readme.txt"))).toBe("document");
    });

    it("returns the generic kind for unknown / extension-less files", () => {
      expect(fileKind(new File([], "firmware"))).toBe("file");
      expect(fileKind(new File([], "archive.unknownext"))).toBe("file");
    });
  });

  it("passes through className and aria-label to the list element", () => {
    render(<FileList items={files} className="extra" aria-label="Attachments" />);
    const list = screen.getByRole("list", { name: "Attachments" });
    expect(list.className).toContain("extra");
  });
});
