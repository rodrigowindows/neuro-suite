import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
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
  emoji: "Atenção",
};

describe("ScanResult", () => {
  it("renders status icon and status badge without emoji", () => {
    const { getByTestId } = render(<ScanResult result={mockResult} userName="" />);
    expect(getByTestId("scan-status-icon")).toBeInTheDocument();
    expect(getByTestId("scan-status-badge")).toHaveTextContent("Atenção");
  });

  it("displays stress level label", () => {
    const { getByText } = render(<ScanResult result={mockResult} userName="" />);
    expect(getByText(/Moderado/)).toBeInTheDocument();
  });

  it("shows blink rate", () => {
    const { getByText } = render(<ScanResult result={mockResult} userName="" />);
    expect(getByText("20 piscadas/min")).toBeInTheDocument();
  });

  it("displays user name when provided", () => {
    const { getByText } = render(<ScanResult result={mockResult} userName="João" />);
    expect(getByText(/João/)).toBeInTheDocument();
  });

  it("shows HRV when provided", () => {
    const resultWithHrv: StressResult = { ...mockResult, hrvValue: 45 };
    const { getByText } = render(<ScanResult result={resultWithHrv} userName="" />);
    expect(getByText("45")).toBeInTheDocument();
    expect(getByText("ms")).toBeInTheDocument();
  });

  it("hides HRV column when not provided", () => {
    const { queryByText } = render(<ScanResult result={mockResult} userName="" />);
    expect(queryByText("HRV")).not.toBeInTheDocument();
  });

  it("displays diagnostic label", () => {
    const { getByText } = render(<ScanResult result={mockResult} userName="" />);
    expect(getByText("Normal")).toBeInTheDocument();
  });

  it("renders vision model confidence metric", () => {
    const { getByTestId, getByText } = render(<ScanResult result={mockResult} userName="" />);
    expect(getByTestId("ai-confidence")).toBeInTheDocument();
    expect(getByText("Confiança do Modelo de Visão: 94% (valor de demonstração)")).toBeInTheDocument();
  });

  it("shows PNL tip section without emoji", () => {
    const { getByText } = render(<ScanResult result={mockResult} userName="" />);
    expect(getByText("Dica PNL:")).toBeInTheDocument();
  });

  it("renders PostScanActionPlan", () => {
    const { getByTestId } = render(<ScanResult result={mockResult} userName="" />);
    expect(getByTestId("post-scan-action-plan")).toBeInTheDocument();
  });

  it("handles low stress level", () => {
    const lowResult: StressResult = {
      ...mockResult,
      stressLevel: "low",
      emoji: "OK",
    };
    const { getByText, getByTestId } = render(<ScanResult result={lowResult} userName="" />);
    expect(getByTestId("scan-status-badge")).toHaveTextContent("Estável");
    expect(getByText(/Baixo/)).toBeInTheDocument();
  });

  it("handles high stress level", () => {
    const highResult: StressResult = {
      ...mockResult,
      stressLevel: "high",
      emoji: "Alerta",
    };
    const { getByText, getByTestId } = render(<ScanResult result={highResult} userName="" />);
    expect(getByTestId("scan-status-badge")).toHaveTextContent("Alerta");
    expect(getByText(/Alto/)).toBeInTheDocument();
  });
});
