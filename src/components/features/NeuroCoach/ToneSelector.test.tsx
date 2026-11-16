import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ToneSelector from "./ToneSelector";
import { LangProvider } from "@/i18n";

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

  it("renders header text without emoji", () => {
    const { getByText, queryByText } = render(<ToneSelector value="" onChange={() => {}} />);
    expect(getByText("Escolha teu tom de comunicação:")).toBeInTheDocument();
    expect(queryByText(/🎯/)).not.toBeInTheDocument();
  });

  it("applies accent styling classes", () => {
    const { container } = render(<ToneSelector value="" onChange={() => {}} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("bg-accent");
    expect(wrapper.className).toContain("border-accent");
  });

  describe("Bilingual i18n support", () => {
    it("renders in English under LangProvider initialLang=en", () => {
      // Arrange & Act
      const { getByText, queryByText } = render(
        <LangProvider initialLang="en">
          <ToneSelector value="" onChange={() => {}} />
        </LangProvider>
      );

      // Assert EN texts
      expect(getByText("Choose your communication tone:")).toBeInTheDocument();
      expect(getByText("Select how you prefer AstroAssist to communicate with you")).toBeInTheDocument();
      expect(getByText("Select a tone...")).toBeInTheDocument();

      // Assert PT texts are not present
      expect(queryByText(/Escolha teu tom de comunicação/)).not.toBeInTheDocument();
      expect(queryByText(/Selecione como prefere/)).not.toBeInTheDocument();
      expect(queryByText("Selecione um tom...")).not.toBeInTheDocument();
    });

    it("renders in Portuguese under LangProvider initialLang=pt", () => {
      // Arrange & Act
      const { getByText, queryByText } = render(
        <LangProvider initialLang="pt">
          <ToneSelector value="" onChange={() => {}} />
        </LangProvider>
      );

      // Assert PT texts
      expect(getByText("Escolha teu tom de comunicação:")).toBeInTheDocument();
      expect(getByText(/Selecione como prefere que o AstroAssist/)).toBeInTheDocument();
      expect(getByText("Selecione um tom...")).toBeInTheDocument();

      // Assert EN texts are not present
      expect(queryByText("Choose your communication tone:")).not.toBeInTheDocument();
    });
  });
});
