import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ToneSelector from "./ToneSelector";

// Note: Radix Select has jsdom compatibility issues with scrollIntoView
// Tests that open the select dropdown are skipped

describe("ToneSelector", () => {
  it("renders title", () => {
    render(<ToneSelector value="" onChange={() => {}} />);
    expect(screen.getByText(/Escolha teu tom de comunicação/)).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<ToneSelector value="" onChange={() => {}} />);
    expect(screen.getByText(/Selecione como prefere/)).toBeInTheDocument();
  });

  it("shows placeholder when no value", () => {
    render(<ToneSelector value="" onChange={() => {}} />);
    expect(screen.getByText("Selecione um tom...")).toBeInTheDocument();
  });

  it("renders select trigger", () => {
    render(<ToneSelector value="" onChange={() => {}} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("has correct emoji in header", () => {
    render(<ToneSelector value="" onChange={() => {}} />);
    expect(screen.getByText(/🎯/)).toBeInTheDocument();
  });

  it("applies accent styling classes", () => {
    const { container } = render(<ToneSelector value="" onChange={() => {}} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("bg-accent");
    expect(wrapper.className).toContain("border-accent");
  });
});
