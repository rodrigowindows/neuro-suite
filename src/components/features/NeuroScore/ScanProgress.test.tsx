import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ScanProgress from "./ScanProgress";

describe("ScanProgress", () => {
  it("renders progress percentage", () => {
    render(<ScanProgress progress={50} />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("rounds progress to integer", () => {
    render(<ScanProgress progress={33.7} />);
    expect(screen.getByText("34%")).toBeInTheDocument();
  });

  it("shows 0% at start", () => {
    render(<ScanProgress progress={0} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("shows 100% when complete", () => {
    render(<ScanProgress progress={100} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("displays label text", () => {
    render(<ScanProgress progress={25} />);
    expect(screen.getByText("Progresso do scan")).toBeInTheDocument();
  });
});
