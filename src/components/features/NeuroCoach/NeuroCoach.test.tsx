import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import NeuroCoach from './index';

describe('AstroAssist - Prescrição de Contramedidas', () => {
  const getTodayKey = () => `crewvitals_countermeasures_${new Date().toISOString().split('T')[0]}`;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('1. Renderização dos Elementos Obrigatórios', () => {
    it('renderiza o banner de alerta vermelho com "Status: Fadiga Detectada."', () => {
      render(<NeuroCoach stressLevel="high" />);
      const alertBanner = screen.getByRole('alert');
      expect(alertBanner).toBeInTheDocument();
      expect(alertBanner).toHaveClass('border-red-500/30');
      expect(screen.getByText('Status: Fadiga Detectada.')).toBeInTheDocument();
    });

    it('renderiza os três checkboxes de contramedidas obrigatórias', () => {
      render(<NeuroCoach stressLevel="high" />);

      // Checkbox 1: Respiração
      const checkbox1 = screen.getByRole('checkbox', {
        name: /Ação 1 \(Respiração\): Executar ciclo 4-7-8 por 3 minutos\./i,
      });
      expect(checkbox1).toBeInTheDocument();
      expect(checkbox1).not.toBeChecked();

      // Checkbox 2: Hidratação
      const checkbox2 = screen.getByRole('checkbox', {
        name: /Ação 2 \(Hidratação\): Ingestão de 500ml de água\./i,
      });
      expect(checkbox2).toBeInTheDocument();
      expect(checkbox2).not.toBeChecked();

      // Checkbox 3: Descanso
      const checkbox3 = screen.getByRole('checkbox', {
        name: /Ação 3 \(Descanso\): Agendar ciclo de sono de 90 min no Biometric Log\./i,
      });
      expect(checkbox3).toBeInTheDocument();
      expect(checkbox3).not.toBeChecked();
    });
  });

  describe('2. Funcionamento do Timer e Persistência no LocalStorage', () => {
    it('controla o timer de 3 minutos: iniciar, pausar e zerar', () => {
      vi.useFakeTimers();
      render(<NeuroCoach stressLevel="high" />);

      const timerDisplay = screen.getByTestId('timer-display');
      expect(timerDisplay).toHaveTextContent('3:00');

      // Iniciar
      const startButton = screen.getByRole('button', { name: /Timer Guiado \(3 min\)/i });
      fireEvent.click(startButton);

      // Avança 3 segundos
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(timerDisplay).toHaveTextContent('2:57');

      // Pausar
      const pauseButton = screen.getByRole('button', { name: /Pausar Timer/i });
      fireEvent.click(pauseButton);

      // Não deve avançar enquanto pausado
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(timerDisplay).toHaveTextContent('2:57');

      // Zerar / Reiniciar
      const resetButton = screen.getByRole('button', { name: /Zerar \/ Reiniciar/i });
      fireEvent.click(resetButton);
      expect(timerDisplay).toHaveTextContent('3:00');

      vi.useRealTimers();
    });

    it('marca automaticamente a Ação 1 (Respiração) após avançar 180 segundos no timer do ciclo 4-7-8', () => {
      // Arrange
      vi.useFakeTimers();
      render(<NeuroCoach stressLevel="high" />);

      const checkbox1 = screen.getByRole('checkbox', {
        name: /Ação 1 \(Respiração\): Executar ciclo 4-7-8 por 3 minutos\./i,
      });
      expect(checkbox1).not.toBeChecked();

      const startButton = screen.getByRole('button', { name: /Timer Guiado \(3 min\)/i });

      // Act: Inicia o timer e avança 180 segundos até zerar
      fireEvent.click(startButton);
      act(() => {
        vi.advanceTimersByTime(180000);
      });

      // Assert
      const timerDisplay = screen.getByTestId('timer-display');
      expect(timerDisplay).toHaveTextContent('0:00');
      expect(checkbox1).toBeChecked();

      // Teardown: Restaura os timers
      vi.useRealTimers();
    });

    it('persiste a marcação dos 3 checkboxes no localStorage e preserva o estado após recarregamento de página', () => {
      // Arrange
      const todayKey = getTodayKey();
      const { unmount } = render(<NeuroCoach stressLevel="high" />);

      const checkbox1 = screen.getByRole('checkbox', {
        name: /Ação 1 \(Respiração\): Executar ciclo 4-7-8 por 3 minutos\./i,
      });
      const checkbox2 = screen.getByRole('checkbox', {
        name: /Ação 2 \(Hidratação\): Ingestão de 500ml de água\./i,
      });
      const checkbox3 = screen.getByRole('checkbox', {
        name: /Ação 3 \(Descanso\): Agendar ciclo de sono de 90 min no Biometric Log\./i,
      });

      // Act: Marca todos os 3 checkboxes
      fireEvent.click(checkbox1);
      fireEvent.click(checkbox2);
      fireEvent.click(checkbox3);

      // Assert: Verifica se estão marcados e salvos no localStorage
      expect(checkbox1).toBeChecked();
      expect(checkbox2).toBeChecked();
      expect(checkbox3).toBeChecked();

      const savedData = JSON.parse(localStorage.getItem(todayKey) || '{}');
      expect(savedData).toEqual({
        breathing: true,
        hydration: true,
        rest: true,
      });

      // Act (Simula recarregamento de página desmontando e remontando o componente)
      unmount();
      render(<NeuroCoach stressLevel="high" />);

      // Assert
      const reloadedCheckbox1 = screen.getByRole('checkbox', {
        name: /Ação 1 \(Respiração\): Executar ciclo 4-7-8 por 3 minutos\./i,
      });
      const reloadedCheckbox2 = screen.getByRole('checkbox', {
        name: /Ação 2 \(Hidratação\): Ingestão de 500ml de água\./i,
      });
      const reloadedCheckbox3 = screen.getByRole('checkbox', {
        name: /Ação 3 \(Descanso\): Agendar ciclo de sono de 90 min no Biometric Log\./i,
      });

      expect(reloadedCheckbox1).toBeChecked();
      expect(reloadedCheckbox2).toBeChecked();
      expect(reloadedCheckbox3).toBeChecked();
      expect(screen.getByText(/Progresso das Contramedidas: 3 de 3 executadas/i)).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('3. Ausência do Dropdown de Tom de Comunicação', () => {
    it('confirma que o dropdown "Escolha seu tom de comunicação" não existe mais no componente', () => {
      render(<NeuroCoach stressLevel="high" />);
      expect(screen.queryByText(/Escolha seu tom de comunicação/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
  });

  describe('4. Exportação do Plano Operacional', () => {
    it('exporta o plano baixando o arquivo como plano-crewvitals.txt', () => {
      render(<NeuroCoach stressLevel="high" />);
      const exportButton = screen.getByRole('button', { name: /Exportar Plano/i });
      expect(exportButton).toBeInTheDocument();

      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:http://localhost/mock-blob');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      let capturedDownload = '';
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const el = originalCreateElement(tagName);
        if (tagName === 'a') {
          Object.defineProperty(el, 'download', {
            set: (val: string) => { capturedDownload = val; },
            get: () => capturedDownload,
          });
        }
        return el;
      });
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      fireEvent.click(exportButton);
      expect(capturedDownload).toBe('plano-crewvitals.txt');

      clickSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
      vi.restoreAllMocks();
    });
  });
});
