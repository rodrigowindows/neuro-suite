import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PredictiveAlert from './PredictiveAlert';
import { LangProvider } from '@/i18n';

describe('PredictiveAlert Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Renderização sem provider (fallback PT)', () => {
    it('renderiza textos em português por padrão fora de LangProvider', () => {
      // Arrange & Act
      const { container } = render(<PredictiveAlert />);

      // Assert
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Demonstração')).toBeInTheDocument();
      expect(
        screen.getByText(
          /Risco de erro em tarefas de precisão nas próximas 4 h — suspender acoplagem\/EVA\./i
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Cenário demonstrativo — não é uma previsão clínica validada\./i
        )
      ).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(container.textContent).not.toContain('⚠️');
      expect(container.querySelector('.animate-pulse')).toBeNull();
      expect(container.querySelector('.border-destructive')).toBeNull();
    });

    it('não exibe prefixo BioScore quando bioScore não é fornecido', () => {
      // Arrange & Act
      render(<PredictiveAlert />);

      // Assert
      expect(screen.queryByText(/BioScore/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/34\/100/i)).not.toBeInTheDocument();
    });

    it('exibe bioScore dinâmico quando fornecido como prop', () => {
      // Arrange & Act
      render(<PredictiveAlert bioScore={75} />);

      // Assert
      expect(screen.getByText(/BioScore 75 —/i)).toBeInTheDocument();
      expect(
        screen.getByText(
          /BioScore 75 — Risco de erro em tarefas de precisão nas próximas 4 h — suspender acoplagem\/EVA\./i
        )
      ).toBeInTheDocument();
    });
  });

  describe('Renderização com LangProvider em Inglês (EN)', () => {
    it('renderiza badge Demo, mensagem e ressalva em inglês sem bioScore', () => {
      // Arrange & Act
      const { container } = render(
        <LangProvider initialLang="en">
          <PredictiveAlert />
        </LangProvider>
      );

      // Assert
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Demo')).toBeInTheDocument();
      expect(
        screen.getByText(
          /Risk of errors in precision tasks over the next 4 h — suspend docking\/EVA\./i
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Demonstration scenario — not a validated clinical prediction\./i
        )
      ).toBeInTheDocument();
      expect(screen.queryByText(/BioScore/i)).not.toBeInTheDocument();
      expect(container.textContent).not.toContain('⚠️');
    });

    it('renderiza textos em inglês com bioScore dinâmico interpolado', () => {
      // Arrange & Act
      render(
        <LangProvider initialLang="en">
          <PredictiveAlert bioScore={34} />
        </LangProvider>
      );

      // Assert
      expect(screen.getByText('Demo')).toBeInTheDocument();
      expect(
        screen.getByText(
          /BioScore 34 — Risk of errors in precision tasks over the next 4 h — suspend docking\/EVA\./i
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Demonstration scenario — not a validated clinical prediction\./i
        )
      ).toBeInTheDocument();
      expect(screen.queryByText(/34\/100/i)).not.toBeInTheDocument();
    });
  });

  describe('Renderização com LangProvider em Português (PT)', () => {
    it('renderiza badge Demonstração, mensagem e ressalva em português com bioScore', () => {
      // Arrange & Act
      render(
        <LangProvider initialLang="pt">
          <PredictiveAlert bioScore={72} />
        </LangProvider>
      );

      // Assert
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Demonstração')).toBeInTheDocument();
      expect(
        screen.getByText(
          /BioScore 72 — Risco de erro em tarefas de precisão nas próximas 4 h — suspender acoplagem\/EVA\./i
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Cenário demonstrativo — não é uma previsão clínica validada\./i
        )
      ).toBeInTheDocument();
    });
  });

  describe('Interatividade e Estilo', () => {
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

    it('aplica cursor pointer e hover quando onMitigate é fornecido', () => {
      // Arrange & Act
      const { rerender } = render(<PredictiveAlert />);
      const alertEl = screen.getByRole('alert');
      expect(alertEl.className).not.toContain('cursor-pointer');

      // Act 2
      rerender(<PredictiveAlert onMitigate={() => {}} />);

      // Assert 2
      expect(alertEl.className).toContain('cursor-pointer');
    });
  });
});
