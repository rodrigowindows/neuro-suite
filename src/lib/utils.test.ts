import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn (classnames utility)", () => {
  it("merges class names", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toContain("text-red-500");
    expect(result).toContain("bg-blue-500");
  });

  it("handles conditional classes", () => {
    const result = cn("base", false && "excluded", true && "included");
    expect(result).toContain("base");
    expect(result).toContain("included");
    expect(result).not.toContain("excluded");
  });

  it("handles undefined values", () => {
    const result = cn("base", undefined, "valid");
    expect(result).toContain("base");
    expect(result).toContain("valid");
  });

  it("merges conflicting tailwind classes", () => {
    const result = cn("px-2", "px-4");
    // tailwind-merge keeps the last value
    expect(result).toContain("px-4");
    expect(result).not.toContain("px-2");
  });

  it("handles empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles array of classes", () => {
    const result = cn(["class1", "class2"]);
    expect(result).toContain("class1");
    expect(result).toContain("class2");
  });
});
