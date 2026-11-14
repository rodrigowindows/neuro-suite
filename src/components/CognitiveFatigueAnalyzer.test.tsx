import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CognitiveFatigueAnalyzer from './CognitiveFatigueAnalyzer';

describe('CognitiveFatigueAnalyzer Component', () => {
  it('renderiza o título "Métricas de Fadiga Cognitiva"', () => {
    render(<CognitiveFatigueAnalyzer />);
    expect(screen.getByText('Métricas de Fadiga Cognitiva')).toBeInTheDocument();
  });

  it('renderiza o label e placeholder com o texto de apoio operacional e aviso médico', () => {
    render(<CognitiveFatigueAnalyzer />);
    const expectedNotice = 'Registre observações do turno para análise de carga cognitiva (não substitui avaliação médica).';
    
    // Label
    expect(screen.getByText(expectedNotice)).toBeInTheDocument();
    
    // Textarea com placeholder contendo a frase
    const textarea = screen.getByPlaceholderText(/Registre observações do turno para análise de carga cognitiva \(não substitui avaliação médica\)/i);
    expect(textarea).toBeInTheDocument();
  });

  it('abre o modal do Radix Dialog ao clicar em "Research & Validation (NASA / Harvard)" exibindo as evidências e disclaimer', () => {
    render(<CognitiveFatigueAnalyzer />);

    const button = screen.getByRole('button', { name: /Research & Validation \(NASA \/ Harvard\)/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    // Modal aberto
    expect(screen.getByText(/Base Científica e Evidências Operacionais/i)).toBeInTheDocument();
    expect(screen.getByText(/NASA Human Research Program — Behavioral Health & Performance: Cognitive Fatigue in Extreme Environments\./i)).toBeInTheDocument();
    expect(screen.getByText(/Blink Rate as a Physiological Measure of Fatigue — NASA Technical Reports & FAA Flight Standards\./i)).toBeInTheDocument();
    expect(screen.getByText(/Protocolo Parassimpático 4-7-8 — Harvard Medical School \/ Integrative Medicine\./i)).toBeInTheDocument();
    expect(screen.getByText(/O CrewVitals atua como Sistema de Suporte à Decisão \(DSS\) operacional e não substitui diagnóstico médico\./i)).toBeInTheDocument();
  });
});
