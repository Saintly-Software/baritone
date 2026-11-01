import { layoutContract } from "../../theme/layout.css";

export type LayoutEdge = "top" | "right" | "bottom" | "left";

export type LayoutCorner = "bottom-right" | "bottom-left";

export interface LayoutEdgeRegionOptions {
  edge: LayoutEdge;

  pinned?: boolean;

  order?: number;
}

export interface LayoutCornerRegionOptions {
  corner: LayoutCorner;
}

export type LayoutRegionOptions = LayoutEdgeRegionOptions | LayoutCornerRegionOptions;

export interface LayoutSize {
  width: number;
  height: number;
}

export interface LayoutInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
  fab: Record<LayoutCorner, LayoutSize>;
}

export const EDGES: readonly LayoutEdge[] = ["top", "right", "bottom", "left"];

export const CORNERS: readonly LayoutCorner[] = ["bottom-right", "bottom-left"];

const varName = (reference: string) => reference.slice(4, -1);

export const INSET_VAR: Record<LayoutEdge, string> = {
  top: varName(layoutContract.inset.top),
  right: varName(layoutContract.inset.right),
  bottom: varName(layoutContract.inset.bottom),
  left: varName(layoutContract.inset.left),
};

export const FAB_VAR: Record<LayoutCorner, Record<keyof LayoutSize, string>> = {
  "bottom-right": {
    width: varName(layoutContract.fab.bottomRight.width),
    height: varName(layoutContract.fab.bottomRight.height),
  },
  "bottom-left": {
    width: varName(layoutContract.fab.bottomLeft.width),
    height: varName(layoutContract.fab.bottomLeft.height),
  },
};

export const OFFSET_VAR = varName(layoutContract.offset);

const LENGTH_VARS = [
  ...Object.values(INSET_VAR),
  ...CORNERS.flatMap((corner) => Object.values(FAB_VAR[corner])),
  OFFSET_VAR,
];

export const EMPTY_INSETS: LayoutInsets = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  fab: {
    "bottom-right": { width: 0, height: 0 },
    "bottom-left": { width: 0, height: 0 },
  },
};

interface Registration {
  element: HTMLElement;
  options: LayoutRegionOptions;
}

type EdgeRegistration = Registration & { options: LayoutEdgeRegionOptions };

const isEdge = (registration: Registration): registration is EdgeRegistration =>
  "edge" in registration.options;

const px = (value: number) => `${value}px`;

function registerLengthProperties() {
  if (typeof CSS === "undefined" || typeof CSS.registerProperty !== "function") return;
  for (const name of LENGTH_VARS) {
    try {
      CSS.registerProperty({ name, syntax: "<length>", inherits: true, initialValue: "0px" });
    } catch {
      continue;
    }
  }
}

function sameInsets(a: LayoutInsets, b: LayoutInsets): boolean {
  return (
    EDGES.every((edge) => a[edge] === b[edge]) &&
    CORNERS.every(
      (corner) =>
        a.fab[corner].width === b.fab[corner].width &&
        a.fab[corner].height === b.fab[corner].height,
    )
  );
}

export class LayoutRegistry {
  #registrations = new Set<Registration>();
  #listeners = new Set<() => void>();
  #snapshot: LayoutInsets = EMPTY_INSETS;
  #root: HTMLElement | undefined;
  #observer: ResizeObserver | undefined;
  #frame: number | undefined;

  connect = (root: HTMLElement = document.documentElement) => {
    this.#root = root;
    registerLengthProperties();
    if (typeof ResizeObserver !== "undefined") {
      this.#observer = new ResizeObserver(this.schedule);
      for (const { element } of this.#registrations) this.#observer.observe(element);
    }
    window.addEventListener("resize", this.schedule);
    this.flush();
  };

  disconnect = () => {
    window.removeEventListener("resize", this.schedule);
    this.#observer?.disconnect();
    this.#observer = undefined;
    if (this.#frame !== undefined) cancelAnimationFrame(this.#frame);
    this.#frame = undefined;
    for (const name of LENGTH_VARS) this.#root?.style.removeProperty(name);
    for (const { element } of this.#registrations) element.style.removeProperty(OFFSET_VAR);
    this.#root = undefined;
  };

  register = (element: HTMLElement, options: LayoutRegionOptions): (() => void) => {
    const registration: Registration = { element, options };
    this.#registrations.add(registration);
    this.#observer?.observe(element);
    this.schedule();
    return () => {
      this.#registrations.delete(registration);
      if (![...this.#registrations].some((other) => other.element === element)) {
        this.#observer?.unobserve(element);
        element.style.removeProperty(OFFSET_VAR);
      }
      this.schedule();
    };
  };

  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  getSnapshot = (): LayoutInsets => this.#snapshot;

  schedule = () => {
    if (this.#root === undefined || this.#frame !== undefined) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = undefined;
      this.flush();
    });
  };

  flush = () => {
    const root = this.#root;
    if (root === undefined) return;

    for (const edge of EDGES) this.#writeEdge(root, edge);
    for (const corner of CORNERS) this.#writeCorner(root, corner);

    const next = this.#read(root);
    if (sameInsets(next, this.#snapshot)) return;
    this.#snapshot = next;
    for (const listener of this.#listeners) listener();
  };

  #writeEdge(root: HTMLElement, edge: LayoutEdge) {
    const stack = [...this.#registrations]
      .filter(isEdge)
      .filter((registration) => registration.options.edge === edge)
      .toSorted((a, b) => compareStackOrder(a, b, edge));

    let total = 0;
    let pinned = false;
    for (const { element, options } of stack) {
      element.style.setProperty(OFFSET_VAR, px(total));
      if (options.pinned === false) continue;
      pinned = true;
      const rect = element.getBoundingClientRect();
      total += edge === "top" || edge === "bottom" ? rect.height : rect.width;
    }

    if (pinned) root.style.setProperty(INSET_VAR[edge], px(total));
    else root.style.removeProperty(INSET_VAR[edge]);
  }

  #writeCorner(root: HTMLElement, corner: LayoutCorner) {
    const elements = [...this.#registrations]
      .filter(
        (registration) =>
          !isEdge(registration) &&
          (registration.options as LayoutCornerRegionOptions).corner === corner,
      )
      .map(({ element }) => element);

    const names = FAB_VAR[corner];
    if (elements.length === 0) {
      root.style.removeProperty(names.width);
      root.style.removeProperty(names.height);
      return;
    }

    let width = 0;
    let height = 0;
    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      width = Math.max(
        width,
        corner === "bottom-right" ? window.innerWidth - rect.left : rect.right,
      );
      height = Math.max(height, window.innerHeight - rect.top);
    }
    root.style.setProperty(names.width, px(width));
    root.style.setProperty(names.height, px(height));
  }

  #read(root: HTMLElement): LayoutInsets {
    const computed = getComputedStyle(root);
    const read = (name: string) => Number.parseFloat(computed.getPropertyValue(name)) || 0;
    return {
      top: read(INSET_VAR.top),
      right: read(INSET_VAR.right),
      bottom: read(INSET_VAR.bottom),
      left: read(INSET_VAR.left),
      fab: {
        "bottom-right": {
          width: read(FAB_VAR["bottom-right"].width),
          height: read(FAB_VAR["bottom-right"].height),
        },
        "bottom-left": {
          width: read(FAB_VAR["bottom-left"].width),
          height: read(FAB_VAR["bottom-left"].height),
        },
      },
    };
  }
}

function compareStackOrder(a: EdgeRegistration, b: EdgeRegistration, edge: LayoutEdge): number {
  const byOrder = (a.options.order ?? 0) - (b.options.order ?? 0);
  if (byOrder !== 0) return byOrder;
  if (a.element === b.element) return 0;
  const aFirst = Boolean(
    a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
  const outward = edge === "top" || edge === "left";
  return aFirst === outward ? -1 : 1;
}
