import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ToneSelector from "./ToneSelector";

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

  it("calls onChange when option selected", async () => {
    const handleChange = vi.fn();
    render(<ToneSelector value="" onChange={handleChange} />);
    
    // Open the select
    fireEvent.click(screen.getByRole("combobox"));
    
    // Select technical option
    const technicalOption = await screen.findByText(/Técnico\/Acadêmico/);
    fireEvent.click(technicalOption);
    
    expect(handleChange).toHaveBeenCalledWith("technical");
  });

  it("displays all three tone options when opened", async () => {
    render(<ToneSelector value="" onChange={() => {}} />);
    
    fireEvent.click(screen.getByRole("combobox"));
    
    expect(await screen.findByText(/Técnico\/Acadêmico/)).toBeInTheDocument();
    expect(await screen.findByText(/Descolado Dia-a-Dia/)).toBeInTheDocument();
    expect(await screen.findByText(/Mestre Espiritual/)).toBeInTheDocument();
  });
});
