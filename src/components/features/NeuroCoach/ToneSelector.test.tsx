import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ToneSelector from "./ToneSelector";

// Note: Radix Select has jsdom compatibility issues with scrollIntoView
// Tests that open the select dropdown are skipped

describe("ToneSelector", () => {
  it("renders title", () => {
    const { getByText } = render(<ToneSelector value="" onChange={() => {}} />);
    expect(getByText(/Escolha teu tom de comunicação/)).toBeInTheDocument();
  });

  it("renders description", () => {
    const { getByText } = render(<ToneSelector value="" onChange={() => {}} />);
    expect(getByText(/Selecione como prefere/)).toBeInTheDocument();
  });

  it("shows placeholder when no value", () => {
    const { getByText } = render(<ToneSelector value="" onChange={() => {}} />);
    expect(getByText("Selecione um tom...")).toBeInTheDocument();
  });

  it("renders select trigger", () => {
    const { getByRole } = render(<ToneSelector value="" onChange={() => {}} />);
    expect(getByRole("combobox")).toBeInTheDocument();
  });

  it("has correct emoji in header", () => {
    const { getByText } = render(<ToneSelector value="" onChange={() => {}} />);
    expect(getByText(/🎯/)).toBeInTheDocument();
  });

  it("applies accent styling classes", () => {
    const { container } = render(<ToneSelector value="" onChange={() => {}} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("bg-accent");
    expect(wrapper.className).toContain("border-accent");
  });
});
