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

  it('abre o modal do Radix Dialog ao clicar em "Base Científica" exibindo as evidências', () => {
    render(<CognitiveFatigueAnalyzer />);

    const button = screen.getByRole('button', { name: /Base Científica/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    // Modal aberto
    expect(screen.getByText('Base Científica e Evidências Operacionais')).toBeInTheDocument();
    expect(screen.getByText(/NASA Human Research Program — Cognitive Fatigue/i)).toBeInTheDocument();
    expect(screen.getByText(/Estudos sobre Blink Rate \(Taxa de Piscadas\) e Carga Cognitiva/i)).toBeInTheDocument();
    expect(screen.getByText(/Protocolo de Respiração 4-7-8 \(Harvard Medical School\)/i)).toBeInTheDocument();
  });
});
