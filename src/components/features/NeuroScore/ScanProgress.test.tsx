import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ScanProgress from "./ScanProgress";

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

  it("displays label text", () => {
    const { getByText } = render(<ScanProgress progress={25} />);
    expect(getByText("Progresso do scan")).toBeInTheDocument();
  });
});
