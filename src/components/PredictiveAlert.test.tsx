import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PredictiveAlert from './PredictiveAlert';

describe('PredictiveAlert Component', () => {
  it('renderiza a mensagem objetiva, badge de Demonstração e o rótulo demonstrativo sem emojis ou botões', () => {
    // Arrange & Act
    const { container } = render(<PredictiveAlert />);

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Risco de erro em tarefas de precisão nas próximas 4 h — suspender acoplagem\/EVA\./i
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Demonstração')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Cenário demonstrativo — não é uma previsão clínica validada\./i
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.textContent).not.toContain('⚠️');
    expect(container.querySelector('.animate-pulse')).toBeNull();
  });

  it('não exibe valor fixo ou hardcoded 34 ou 34/100 quando bioScore não é fornecido', () => {
    // Arrange & Act
    render(<PredictiveAlert />);

    // Assert
    expect(screen.queryByText(/34/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/34\/100/i)).not.toBeInTheDocument();
  });

  it('exibe bioScore dinâmico quando fornecido como prop', () => {
    // Arrange & Act
    render(<PredictiveAlert bioScore={75} />);

    // Assert
    expect(screen.getByText(/BioScore 75 —/i)).toBeInTheDocument();
    expect(screen.queryByText(/34/i)).not.toBeInTheDocument();
  });

  it('se bioScore for 34 explicitamente passado via prop, reflete o valor sem texto 34/100 hardcoded', () => {
    // Arrange & Act
    render(<PredictiveAlert bioScore={34} />);

    // Assert
    expect(screen.getByText(/BioScore 34 —/i)).toBeInTheDocument();
    expect(screen.queryByText(/34\/100/i)).not.toBeInTheDocument();
  });

  it('aceita callback onMitigate opcional sem renderizar botão interno', () => {
    // Arrange
    const onMitigate = vi.fn();

    // Act
    render(<PredictiveAlert onMitigate={onMitigate} />);

    // Assert
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(onMitigate).not.toHaveBeenCalled();
  });

  it('aciona callback onMitigate ao clicar no elemento de alerta quando fornecido', () => {
    // Arrange
    const onMitigate = vi.fn();
    render(<PredictiveAlert onMitigate={onMitigate} />);

    // Act
    screen.getByRole('alert').click();

    // Assert
    expect(onMitigate).toHaveBeenCalledTimes(1);
  });

  it('não possui moldura vermelha pesada ou animate-pulse', () => {
    // Arrange & Act
    const { container } = render(<PredictiveAlert />);

    // Assert
    expect(container.querySelector('.animate-pulse')).toBeNull();
    expect(container.querySelector('.border-destructive')).toBeNull();
  });
});
