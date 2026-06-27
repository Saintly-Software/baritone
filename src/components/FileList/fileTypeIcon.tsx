import * as React from "react";

/**
 * Coarse file categories the list shows an icon for. Deliberately small and
 * monochrome — enough to tell an image from a zip at a glance, not a full
 * mimetype atlas. Text-ish files (txt, md, json, …) fold into `document`.
 */
export type FileKind =
  | "image"
  | "audio"
  | "video"
  | "pdf"
  | "archive"
  | "spreadsheet"
  | "document"
  | "file";

/** Extension → kind, the fallback when the `File` has no (or a vague) MIME type. */
const EXT_KIND: Record<string, FileKind> = {
  // images
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  avif: "image",
  bmp: "image",
  ico: "image",
  svg: "image",
  heic: "image",
  // audio
  mp3: "audio",
  wav: "audio",
  ogg: "audio",
  flac: "audio",
  m4a: "audio",
  aac: "audio",
  // video
  mp4: "video",
  mov: "video",
  webm: "video",
  avi: "video",
  mkv: "video",
  m4v: "video",
  // documents
  pdf: "pdf",
  // spreadsheets
  csv: "spreadsheet",
  tsv: "spreadsheet",
  xls: "spreadsheet",
  xlsx: "spreadsheet",
  ods: "spreadsheet",
  // archives
  zip: "archive",
  rar: "archive",
  "7z": "archive",
  tar: "archive",
  gz: "archive",
  bz2: "archive",
  xz: "archive",
  // word-processing + plain text
  doc: "document",
  docx: "document",
  odt: "document",
  rtf: "document",
  pages: "document",
  txt: "document",
  md: "document",
  json: "document",
  xml: "document",
  yml: "document",
  yaml: "document",
  log: "document",
};

/**
 * Classify a `File`. MIME type wins for the broad media buckets (it's the most
 * reliable signal when present); otherwise the filename extension decides, with
 * a generic `file` as the last resort. Many `File`s — drag-and-drop, some OSes —
 * carry an empty `type`, hence the extension fallback.
 */
export function fileKind(file: File): FileKind {
  const type = file.type;
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("audio/")) return "audio";
  if (type.startsWith("video/")) return "video";
  if (type === "application/pdf") return "pdf";

  const dot = file.name.lastIndexOf(".");
  const ext = dot > -1 ? file.name.slice(dot + 1).toLowerCase() : "";
  const byExt = EXT_KIND[ext];
  if (byExt != null) return byExt;

  if (type.startsWith("text/")) return "document";
  return "file";
}

/** Shared base for the "page" glyphs (file / document / spreadsheet / pdf). */
const page = (
  <>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5" />
  </>
);

const GLYPHS: Record<FileKind, React.ReactNode> = {
  file: page,
  document: (
    <>
      {page}
      <path d="M9 13h6M9 17h5" />
    </>
  ),
  spreadsheet: (
    <>
      {page}
      <path d="M8 13h8M8 17h8M12 13v4" />
    </>
  ),
  pdf: (
    <>
      {page}
      <rect x="7.5" y="13.5" width="9" height="4.5" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="M21 15l-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </>
  ),
  audio: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  video: (
    <>
      <path d="M22 8l-6 4 6 4V8Z" />
      <rect x="2" y="6" width="14" height="12" rx="2" />
    </>
  ),
  archive: (
    <>
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </>
  ),
};

export interface FileTypeIconProps {
  /** The file to classify and draw an icon for. */
  file: File;
  className?: string;
}

/**
 * A small, decorative glyph for a file's type. Sized at `1em` and drawn with
 * `currentColor`, so it scales with — and tints to — whatever chip it sits in
 * (including the dimmed `aria-disabled` foreground). `aria-hidden`: the chip's
 * filename already names the entry.
 */
export function FileTypeIcon({ file, className }: FileTypeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {GLYPHS[fileKind(file)]}
    </svg>
  );
}
