import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ScanProgress from "./ScanProgress";
import { LangProvider } from "@/i18n";

describe("ScanProgress", () => {
  it("renders progress percentage", () => {
    const { getByText } = render(<ScanProgress progress={50} />);
    expect(getByText("50%")).toBeInTheDocument();
  });

  it("rounds progress to integer", () => {
    const { getByText } = render(<ScanProgress progress={33.7} />);
    expect(getByText("34%")).toBeInTheDocument();
  });

  it("shows 0% at start", () => {
    const { getByText } = render(<ScanProgress progress={0} />);
    expect(getByText("0%")).toBeInTheDocument();
  });

  it("shows 100% when complete", () => {
    const { getByText } = render(<ScanProgress progress={100} />);
    expect(getByText("100%")).toBeInTheDocument();
  });

  it("displays label text in Portuguese by default", () => {
    const { getByText } = render(<ScanProgress progress={25} />);
    expect(getByText("Progresso do scan")).toBeInTheDocument();
  });

  it("renders English label under LangProvider initialLang='en'", () => {
    const { getByText, queryByText } = render(
      <LangProvider initialLang="en">
        <ScanProgress progress={25} />
      </LangProvider>
    );
    expect(getByText("Scan progress")).toBeInTheDocument();
    expect(queryByText("Progresso do scan")).not.toBeInTheDocument();
  });

  it("renders Portuguese label under LangProvider initialLang='pt'", () => {
    const { getByText } = render(
      <LangProvider initialLang="pt">
        <ScanProgress progress={25} />
      </LangProvider>
    );
    expect(getByText("Progresso do scan")).toBeInTheDocument();
  });
});
