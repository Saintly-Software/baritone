import { describe, expect, it } from "vitest";
import { keyedElements } from "./keyedElements";

describe("keyedElements", () => {
  it("drops falsy entries, keeping the real elements in order", () => {
    const cond = false;
    const result = keyedElements([
      <span>a</span>,
      cond && <span>b</span>,
      null,
      undefined,
      <span>c</span>,
    ]);
    expect(result).toHaveLength(2);
    expect(result.map((el) => el.props.children)).toEqual(["a", "c"]);
  });

  it("keys surviving elements by their ORIGINAL index, so a dropped middle entry doesn't renumber the rest", () => {
    // "c" is at original index 2; post-filter indexing would key it "1" and remount it on toggle.
    const result = keyedElements([<span>a</span>, false, <span>c</span>]);
    expect(result.map((el) => el.key)).toEqual(["0", "2"]);
  });

  it("preserves an element's own key over the index fallback", () => {
    const result = keyedElements([<span key="first">a</span>, <span>b</span>]);
    expect(result.map((el) => el.key)).toEqual(["first", "1"]);
  });

  it("treats a missing array as empty rather than throwing", () => {
    expect(keyedElements(undefined)).toEqual([]);
  });
});
