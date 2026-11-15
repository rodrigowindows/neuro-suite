import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { toast } from 'sonner';
import { hasCountermeasureProtocolToday } from '@/lib/missionEvents';
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

  describe('5. Experiência Visual Imersiva do Ciclo de Respiração 4-7-8', () => {
    it('abre o overlay em tela cheia ao clicar em "Iniciar Timer Guiado (3 min)"', () => {
      render(<NeuroCoach stressLevel="high" />);

      expect(screen.queryByTestId('breathing-overlay')).not.toBeInTheDocument();

      const startButton = screen.getByRole('button', { name: /Iniciar Timer Guiado \(3 min\)/i });
      fireEvent.click(startButton);

      const overlay = screen.getByTestId('breathing-overlay');
      expect(overlay).toBeInTheDocument();
      expect(screen.getByText(/Cabine Orbital • Modo Noturno/i)).toBeInTheDocument();
      expect(screen.getByText('Inspire pelo nariz (4s)')).toBeInTheDocument();
      expect(screen.getByTestId('overlay-countdown')).toHaveTextContent('3:00');
    });

    it('abre o overlay imersivo ao clicar em "Executar Protocolo de Mitigação"', () => {
      render(<NeuroCoach stressLevel="high" />);

      const mitigateButton = screen.getByRole('button', { name: /Executar Protocolo de Mitigação/i });
      fireEvent.click(mitigateButton);

      expect(screen.getByTestId('breathing-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('breathing-circle')).toBeInTheDocument();
      expect(screen.getByText('Inspire pelo nariz (4s)')).toBeInTheDocument();
    });

    it('percorre com precisão as 3 fases do ciclo 4-7-8 (4s inspire, 7s retenha, 8s expire)', () => {
      vi.useFakeTimers();
      render(<NeuroCoach stressLevel="high" />);

      const startButton = screen.getByRole('button', { name: /Iniciar Timer Guiado \(3 min\)/i });
      fireEvent.click(startButton);

      // Fase 1: 0s a 3s -> Inspire pelo nariz (4s)
      expect(screen.getByText('Inspire pelo nariz (4s)')).toBeInTheDocument();

      // Avança 4s -> entra na Fase 2: 7s retenha
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(screen.getByText('Retenha o ar nos pulmões (7s)')).toBeInTheDocument();

      // Avança mais 7s -> entra na Fase 3: 8s expire
      act(() => {
        vi.advanceTimersByTime(7000);
      });
      expect(screen.getByText('Expire lentamente pela boca (8s)')).toBeInTheDocument();

      // Avança mais 8s (total 19s) -> inicia novo ciclo na Fase 1
      act(() => {
        vi.advanceTimersByTime(8000);
      });
      expect(screen.getByText('Inspire pelo nariz (4s)')).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('fecha o overlay ao clicar no botão "Cancelar / Fechar"', () => {
      render(<NeuroCoach stressLevel="high" />);

      const startButton = screen.getByRole('button', { name: /Iniciar Timer Guiado \(3 min\)/i });
      fireEvent.click(startButton);
      expect(screen.getByTestId('breathing-overlay')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /Cancelar \/ Fechar/i });
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('breathing-overlay')).not.toBeInTheDocument();
    });

    it('fecha o overlay e marca a Ação 1 (Respiração) como concluída ao término dos 3 minutos', () => {
      vi.useFakeTimers();
      render(<NeuroCoach stressLevel="high" />);

      const checkbox1 = screen.getByRole('checkbox', {
        name: /Ação 1 \(Respiração\): Executar ciclo 4-7-8 por 3 minutos\./i,
      });
      expect(checkbox1).not.toBeChecked();

      const startButton = screen.getByRole('button', { name: /Iniciar Timer Guiado \(3 min\)/i });
      fireEvent.click(startButton);
      expect(screen.getByTestId('breathing-overlay')).toBeInTheDocument();

      // Avança os 180 segundos
      act(() => {
        vi.advanceTimersByTime(180000);
      });

      expect(screen.queryByTestId('breathing-overlay')).not.toBeInTheDocument();
      expect(checkbox1).toBeChecked();

      vi.useRealTimers();
    });

    it('testa abertura do overlay escuro do ciclo de respiração 4-7-8 ao clicar no timer', () => {
      render(<NeuroCoach stressLevel="high" />);

      // Verifica que o overlay não está presente inicialmente
      expect(screen.queryByTestId('breathing-overlay')).not.toBeInTheDocument();

      // Clica no display do timer para abrir a experiência imersiva
      const timerDisplay = screen.getByTestId('timer-display');
      fireEvent.click(timerDisplay);

      // Valida abertura do overlay com estilização escura de cockpit espacial (Modo Noturno)
      const overlay = screen.getByTestId('breathing-overlay');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('bg-slate-950/95');
      expect(screen.getByRole('dialog', { name: /Experiência Imersiva de Respiração 4-7-8/i })).toBeInTheDocument();
      expect(screen.getByText(/Cabine Orbital • Modo Noturno/i)).toBeInTheDocument();
    });

    it('testa se os textos das fases ("Inspire", "Retenha", "Expire") são exibidos corretamente', () => {
      vi.useFakeTimers();
      render(<NeuroCoach stressLevel="high" />);

      // Abre o overlay pelo timer
      const timerButton = screen.getByRole('button', { name: /Iniciar Timer Guiado \(3 min\)/i });
      fireEvent.click(timerButton);

      const overlay = screen.getByTestId('breathing-overlay');
      expect(overlay).toBeInTheDocument();

      // Fase 1 (0-4s): exibe texto "Inspire"
      expect(within(overlay).getByRole('heading', { level: 2, name: /Inspire/i })).toBeInTheDocument();
      expect(within(overlay).getByText('Inspire pelo nariz (4s)')).toBeInTheDocument();

      // Avança 4 segundos: entra na Fase 2 (4-11s), exibe texto "Retenha"
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(within(overlay).getByRole('heading', { level: 2, name: /Retenha/i })).toBeInTheDocument();
      expect(within(overlay).getByText('Retenha o ar nos pulmões (7s)')).toBeInTheDocument();

      // Avança mais 7 segundos: entra na Fase 3 (11-19s), exibe texto "Expire"
      act(() => {
        vi.advanceTimersByTime(7000);
      });
      expect(within(overlay).getByRole('heading', { level: 2, name: /Expire/i })).toBeInTheDocument();
      expect(within(overlay).getByText('Expire lentamente pela boca (8s)')).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('inicializa o protocolo de respiração 4-7-8 automaticamente quando autoStartBreathing={true}', () => {
      // Arrange & Act
      render(<NeuroCoach stressLevel="high" autoStartBreathing={true} />);

      // Assert
      const overlay = screen.getByTestId('breathing-overlay');
      expect(overlay).toBeInTheDocument();
      expect(screen.getByRole('dialog', { name: /Experiência Imersiva de Respiração 4-7-8/i })).toBeInTheDocument();
      expect(screen.getByTestId('breathing-circle')).toBeInTheDocument();
      expect(screen.getByText('Inspire pelo nariz (4s)')).toBeInTheDocument();
      expect(screen.getByTestId('overlay-countdown')).toHaveTextContent('3:00');
    });
  });

  describe('6. Registro de Execução de Contramedidas & Barramento de Eventos', () => {
    it('bloqueia o registro com mensagem de erro quando 0 contramedidas estiverem marcadas', () => {
      // Arrange
      const errorSpy = vi.spyOn(toast, 'error').mockImplementation(() => '' as any);
      const successSpy = vi.spyOn(toast, 'success').mockImplementation(() => '' as any);
      render(<NeuroCoach stressLevel="high" />);

      const registerBtn = screen.getByRole('button', {
        name: /Registrar Execução de Contramedidas/i,
      });
      expect(registerBtn).toBeInTheDocument();

      // Act: Clica no botão sem marcar nenhuma contramedida
      fireEvent.click(registerBtn);

      // Assert: Bloqueia e emite toast de erro exato
      expect(errorSpy).toHaveBeenCalledWith('Marque ao menos uma contramedida executada.');
      expect(successSpy).not.toHaveBeenCalled();
      expect(hasCountermeasureProtocolToday()).toBe(false);

      errorSpy.mockRestore();
      successSpy.mockRestore();
    });

    it('registra com sucesso, emite o toast exato "Protocolo registrado. Status atualizado." e persiste no barramento', () => {
      // Arrange
      const errorSpy = vi.spyOn(toast, 'error').mockImplementation(() => '' as any);
      const successSpy = vi.spyOn(toast, 'success').mockImplementation(() => '' as any);
      render(<NeuroCoach stressLevel="high" />);

      const checkbox1 = screen.getByRole('checkbox', {
        name: /Ação 1 \(Respiração\): Executar ciclo 4-7-8 por 3 minutos\./i,
      });
      const registerBtn = screen.getByRole('button', {
        name: /Registrar Execução de Contramedidas/i,
      });

      // Act: Marca ao menos uma contramedida e registra
      fireEvent.click(checkbox1);
      fireEvent.click(registerBtn);

      // Assert: Toast com texto exato e persistência confirmada
      expect(successSpy).toHaveBeenCalledWith('Protocolo registrado. Status atualizado.');
      expect(errorSpy).not.toHaveBeenCalled();
      expect(hasCountermeasureProtocolToday()).toBe(true);

      errorSpy.mockRestore();
      successSpy.mockRestore();
    });
  });
});
