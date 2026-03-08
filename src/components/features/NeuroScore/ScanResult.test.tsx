import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ScanResult from "./ScanResult";
import { StressResult } from "@/services/stressCalculator";

// Mock PostScanActionPlan to isolate ScanResult tests
vi.mock("@/components/PostScanActionPlan", () => ({
  default: () => <div data-testid="post-scan-action-plan" />,
}));

const mockResult: StressResult = {
  blinkRate: 20,
  stressLevel: "moderate",
  message: "Atenção normal",
  emoji: "😐",
};

describe("ScanResult", () => {
  it("renders emoji", () => {
    render(<ScanResult result={mockResult} userName="" />);
    expect(screen.getByText("😐")).toBeInTheDocument();
  });

  it("displays stress level label", () => {
    render(<ScanResult result={mockResult} userName="" />);
    expect(screen.getByText(/Moderado/)).toBeInTheDocument();
  });

  it("shows blink rate", () => {
    render(<ScanResult result={mockResult} userName="" />);
    expect(screen.getByText("20/min")).toBeInTheDocument();
  });

  it("displays user name when provided", () => {
    render(<ScanResult result={mockResult} userName="João" />);
    expect(screen.getByText(/João/)).toBeInTheDocument();
  });

  it("shows HRV when provided", () => {
    const resultWithHrv: StressResult = { ...mockResult, hrvValue: 45 };
    render(<ScanResult result={resultWithHrv} userName="" />);
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("ms")).toBeInTheDocument();
  });

  it("hides HRV column when not provided", () => {
    render(<ScanResult result={mockResult} userName="" />);
    expect(screen.queryByText("HRV")).not.toBeInTheDocument();
  });

  it("displays diagnostic label", () => {
    render(<ScanResult result={mockResult} userName="" />);
    expect(screen.getByText("Normal")).toBeInTheDocument();
  });

  it("shows PNL tip section", () => {
    render(<ScanResult result={mockResult} userName="" />);
    expect(screen.getByText("💡 Dica PNL:")).toBeInTheDocument();
  });

  it("renders PostScanActionPlan", () => {
    render(<ScanResult result={mockResult} userName="" />);
    expect(screen.getByTestId("post-scan-action-plan")).toBeInTheDocument();
  });

  it("handles low stress level", () => {
    const lowResult: StressResult = {
      ...mockResult,
      stressLevel: "low",
      emoji: "😊",
    };
    render(<ScanResult result={lowResult} userName="" />);
    expect(screen.getByText("😊")).toBeInTheDocument();
    expect(screen.getByText(/Baixo/)).toBeInTheDocument();
  });

  it("handles high stress level", () => {
    const highResult: StressResult = {
      ...mockResult,
      stressLevel: "high",
      emoji: "😟",
    };
    render(<ScanResult result={highResult} userName="" />);
    expect(screen.getByText("😟")).toBeInTheDocument();
    expect(screen.getByText(/Alto/)).toBeInTheDocument();
  });
});
