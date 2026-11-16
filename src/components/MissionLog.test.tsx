import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import MissionLog, {
  formatLocalizedEventDate,
  formatCockpitVerdict,
  formatEventText,
} from './MissionLog';
import { LangProvider } from '@/i18n';
import { getFatigueStorageKey, FATIGUE_DIVERGENCE_MESSAGE } from '@/lib/perceivedFatigue';
import {
  SYMPTOM_OPTIONS,
  DECISION_SUPPORT_DISCLAIMER,
  DECISION_SUPPORT_RECOMMENDATION,
  getSymptomsStorageKey,
  getDailySymptoms,
} from '@/lib/symptoms';
import { getRecentEvents, appendEvent } from '@/lib/missionEvents';
import { getOutboxCount, getOutbox, clearOutbox } from '@/lib/offlineOutbox';
import { getReadinessStatus } from '@/lib/readiness';

vi.mock('@/lib/readiness', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/readiness')>();
  return { ...actual, getReadinessStatus: vi.fn(actual.getReadinessStatus) };
});

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'astronaut-001' },
  }),
}));

const mockMaybeSingle = vi.fn();
const mockUpdateEq = vi.fn();
const mockUpdate = vi.fn();
const mockSelectEq = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
  },
}));

describe('MissionLog (AAA Pattern)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    window.HTMLElement.prototype.hasPointerCapture = vi.fn();
    window.HTMLElement.prototype.releasePointerCapture = vi.fn();
    vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    mockMaybeSingle.mockResolvedValue({
      data: {
        horas_sono: 7,
        treino_realizado: '45 min esteira ARED',
      },
    });

    mockLimit.mockResolvedValue({ data: [] });
    mockOrder.mockReturnValue({ limit: mockLimit });
    mockSelectEq.mockReturnValue({
      maybeSingle: mockMaybeSingle,
      order: mockOrder,
    });

    mockSelect.mockReturnValue({
      eq: mockSelectEq,
    });

    mockUpdateEq.mockResolvedValue({ error: null });

    mockUpdate.mockReturnValue({
      eq: mockUpdateEq,
    });

    mockFrom.mockImplementation((table: string) => {
      return {
        select: mockSelect,
        update: mockUpdate,
      };
    });
  });

  describe('1. Salva e recupera (AAA)', () => {
    it('salva horas_sono e treino no Supabase e grava fadiga percebida no localStorage sob a chave correta', async () => {
      // Arrange
      await act(async () => {
        render(<MissionLog initialFatigue={3} />);
      });

      const inputSono = screen.getByLabelText(/Horas de Sono/i);
      const inputTreino = screen.getByLabelText(/Exercício Realizado Hoje/i);
      const saveButton = screen.getByRole('button', { name: /Salvar Registro/i });

      // Act
      fireEvent.change(inputSono, { target: { value: '8' } });
      fireEvent.change(inputTreino, { target: { value: '60 min ciclismo ergométrico' } });

      await act(async () => {
        fireEvent.click(saveButton);
      });

      // Assert
      // 1. Supabase gravou sono e treino em profiles
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockUpdate).toHaveBeenCalledWith({
        horas_sono: 8,
        treino_realizado: '60 min ciclismo ergométrico',
      });

      // 2. Fadiga gravada no localStorage com timestamp e sem alterar schema
      const todayKey = getFatigueStorageKey();
      const rawStored = localStorage.getItem(todayKey);
      expect(rawStored).not.toBeNull();
      const stored = JSON.parse(rawStored!);
      expect(stored.value).toBe(3);
      expect(stored.timestamp).toBeDefined();

      // 3. Atualiza "Último Registro Salvo" exibindo o texto de fadiga percebida sem emojis
      await waitFor(() => {
        expect(screen.getByText('3 - Fadiga moderada')).toBeInTheDocument();
      });
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Registro salvo',
        })
      );
    });

    it('recupera e exibe a fadiga percebida em "Último Registro" a partir do localStorage', async () => {
      // Arrange: simula fadiga gravada anteriormente
      const todayKey = getFatigueStorageKey();
      localStorage.setItem(
        todayKey,
        JSON.stringify({ value: 4, timestamp: new Date().toISOString() })
      );

      // Act
      await act(async () => {
        render(<MissionLog />);
      });

      // Assert: "Último Registro Salvo" exibe a fadiga recuperada
      await waitFor(() => {
        expect(screen.getByText('4 - Fadiga alta')).toBeInTheDocument();
      });
    });
  });

  describe('2. Validação Zod: rejeita valores 0 e 6 (AAA)', () => {
    it('rejeita submissão de valores fora do intervalo 1-5 e não chama atualização do Supabase', async () => {
      // Arrange
      await act(async () => {
        render(<MissionLog initialFatigue={6} />);
      });

      const inputSono = screen.getByLabelText(/Horas de Sono/i);
      fireEvent.change(inputSono, { target: { value: '7' } });
      const saveButton = screen.getByRole('button', { name: /Salvar Registro/i });

      // Act
      await act(async () => {
        fireEvent.click(saveButton);
      });

      // Assert
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          title: 'Verifique os campos',
        })
      );
    });

    it('rejeita valor 0 para fadiga percebida', async () => {
      // Arrange
      await act(async () => {
        render(<MissionLog initialFatigue={0} />);
      });

      const inputSono = screen.getByLabelText(/Horas de Sono/i);
      fireEvent.change(inputSono, { target: { value: '7' } });
      const saveButton = screen.getByRole('button', { name: /Salvar Registro/i });

      // Act
      await act(async () => {
        fireEvent.click(saveButton);
      });

      // Assert
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
        })
      );
    });
  });

  describe('3. Divergência nos dois sentidos (AAA)', () => {
    it('Sentido 1: fadiga >= 4 e veredito Cockpit GO exibe linha neutra de divergência sem alerta vermelho', async () => {
      // Arrange & Act
      await act(async () => {
        render(<MissionLog cockpitVerdict="GO" initialFatigue={4} />);
      });

      // Assert
      const divergenceEl = screen.getByText(FATIGUE_DIVERGENCE_MESSAGE);
      expect(divergenceEl).toBeInTheDocument();

      // Confirma que é uma linha neutra sem alerta vermelho
      const containerEl = divergenceEl.closest('div');
      expect(containerEl).not.toHaveClass('border-destructive');
      expect(containerEl).not.toHaveClass('bg-destructive');
      expect(containerEl).not.toHaveClass('text-destructive');
      expect(containerEl).not.toHaveClass('text-red-500');
    });

    it('Sentido 2: fadiga <= 2 e veredito Cockpit NO-GO exibe linha neutra de divergência', async () => {
      // Arrange & Act
      await act(async () => {
        render(<MissionLog cockpitVerdict="NO-GO" initialFatigue={2} />);
      });

      // Assert
      const divergenceEl = screen.getByText(FATIGUE_DIVERGENCE_MESSAGE);
      expect(divergenceEl).toBeInTheDocument();
    });

    it('Cenário alinhado: fadiga 1 e veredito GO NÃO exibe linha de divergência', async () => {
      // Arrange & Act
      await act(async () => {
        render(<MissionLog cockpitVerdict="GO" initialFatigue={1} />);
      });

      // Assert
      expect(screen.queryByText(FATIGUE_DIVERGENCE_MESSAGE)).not.toBeInTheDocument();
    });

    it('Cenário alinhado: fadiga 5 e veredito NO-GO NÃO exibe linha de divergência', async () => {
      // Arrange & Act
      await act(async () => {
        render(<MissionLog cockpitVerdict="NO-GO" initialFatigue={5} />);
      });

      // Assert
      expect(screen.queryByText(FATIGUE_DIVERGENCE_MESSAGE)).not.toBeInTheDocument();
    });

    it('Cenário neutro: fadiga 3 com veredito GO ou NO-GO NÃO exibe linha de divergência', async () => {
      // Arrange & Act
      await act(async () => {
        render(<MissionLog cockpitVerdict="GO" initialFatigue={3} />);
      });

      // Assert
      expect(screen.queryByText(FATIGUE_DIVERGENCE_MESSAGE)).not.toBeInTheDocument();
    });
  });

  describe('4. Ausência de endpoints ou tabelas novas (AAA)', () => {
    it('garante que exclusivamente as tabelas existentes ("profiles" e "stress_scans") são consultadas, sem novas chamadas ou tabelas', async () => {
      // Arrange
      await act(async () => {
        render(<MissionLog initialFatigue={3} />);
      });

      const inputSono = screen.getByLabelText(/Horas de Sono/i);
      const saveButton = screen.getByRole('button', { name: /Salvar Registro/i });

      fireEvent.change(inputSono, { target: { value: '7.5' } });

      // Act
      await act(async () => {
        fireEvent.click(saveButton);
      });

      // Assert
      // 1. Todas as chamadas a supabase.from foram única e exclusivamente para as tabelas existentes 'profiles' e 'stress_scans'
      const calledTables = mockFrom.mock.calls.map((call) => call[0]);
      expect(calledTables.length).toBeGreaterThan(0);
      expect(calledTables.every((tbl) => tbl === 'profiles' || tbl === 'stress_scans')).toBe(true);

      // 2. Nenhuma chamada foi feita a tabelas inexistentes ou novas
      expect(mockFrom).not.toHaveBeenCalledWith('perceived_fatigue');
      expect(mockFrom).not.toHaveBeenCalledWith('fatigue_logs');

      // 3. Os campos atualizados no Supabase permanecem estritamente horas_sono e treino_realizado
      expect(mockUpdate).toHaveBeenCalledWith({
        horas_sono: 7.5,
        treino_realizado: null,
      });
    });
  });

  describe('5. Conformidade visual: ausência de emojis', () => {
    it('renderiza os rótulos de texto sem emojis', async () => {
      // Arrange & Act
      let container: HTMLElement;
      await act(async () => {
        const res = render(<MissionLog initialFatigue={2} />);
        container = res.container;
      });

      // Assert: não há emojis conhecidos nos textos visíveis
      const text = container!.textContent || '';
      expect(text).not.toMatch(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u);
    });
  });

  describe('6. Linha de Base Pessoal (AAA)', () => {
    it('exibe "Linha de base em construção (0/3 scans)" quando lista de scans é vazia', async () => {
      // Arrange & Act
      await act(async () => {
        render(<MissionLog initialScans={[]} />);
      });

      // Assert
      expect(screen.getByText('Linha de base em construção (0/3 scans)')).toBeInTheDocument();
      expect(screen.getByText('Linha de Base Pessoal')).toBeInTheDocument();
    });

    it('exibe "Linha de base em construção (2/3 scans)" quando há menos de 3 scans válidos', async () => {
      // Arrange
      const twoScans = [
        { hrv_value: 65, blink_rate: 18.0, created_at: '2026-11-15T09:00:00Z' },
        { hrv_value: 70, blink_rate: 19.5, created_at: '2026-11-14T09:00:00Z' },
      ];

      // Act
      await act(async () => {
        render(<MissionLog initialScans={twoScans} />);
      });

      // Assert
      expect(screen.getByText('Linha de base em construção (2/3 scans)')).toBeInTheDocument();
    });

    it('exibe Linha de Base Pessoal com valores atuais, linha de base e delta formatado (ex: −18% vs. sua linha de base)', async () => {
      // Arrange: 3 scans desc. O scan atual (mais recente) e excluido da mediana.
      // Scan atual: hrv 82, blink 18.2
      // Anteriores: hrv 100 e 110 -> mediana 105 -> delta(82, 105) = -21.9% -> -22%
      // Anteriores: blink 20.0 e 22.0 -> mediana 21.0 -> delta(18.2, 21.0) = -13.3% -> -13%
      const threeScans = [
        { hrv_value: 82, blink_rate: 18.2, created_at: '2026-11-15T10:00:00Z' },
        { hrv_value: 100, blink_rate: 20.0, created_at: '2026-11-14T10:00:00Z' },
        { hrv_value: 110, blink_rate: 22.0, created_at: '2026-11-13T10:00:00Z' },
      ];

      // Act
      await act(async () => {
        render(<MissionLog initialScans={threeScans} />);
      });

      // Assert
      expect(screen.getByText('Linha de Base Pessoal')).toBeInTheDocument();
      // HRV atual e base
      expect(screen.getByText('82 ms')).toBeInTheDocument();
      expect(screen.getByText('Base: 105 ms')).toBeInTheDocument();
      expect(screen.getByText('−22% vs. sua linha de base')).toBeInTheDocument();

      // Piscadas atual e base
      expect(screen.getByText('18/min')).toBeInTheDocument();
      expect(screen.getByText('Base: 21/min')).toBeInTheDocument();
      expect(screen.getByText('−13% vs. sua linha de base')).toBeInTheDocument();
    });

    it('arredonda piscadas apenas na exibição via roundBlinkRate preservando a precisão no delta', async () => {
      // Arrange: scan com decimal longo 60.97764153143847
      const scans = [
        { hrv_value: 55, blink_rate: 60.97764153143847, created_at: '2026-11-15T10:00:00Z' },
        { hrv_value: 50, blink_rate: 60.97764153143847, created_at: '2026-11-14T10:00:00Z' },
        { hrv_value: 50, blink_rate: 60.97764153143847, created_at: '2026-11-13T10:00:00Z' },
      ];

      // Act
      await act(async () => {
        render(<MissionLog initialScans={scans} />);
      });

      // Assert: exibição arredonda para 61/min
      expect(screen.getByText('61/min')).toBeInTheDocument();
      expect(screen.getByText('Base: 61/min')).toBeInTheDocument();
      expect(screen.getByText('0% vs. sua linha de base')).toBeInTheDocument();
      expect(screen.getByText('+10% vs. sua linha de base')).toBeInTheDocument();
    });
  });

  describe('9. Linha de Base via stress_scans no Supabase (AAA)', () => {
    const supabaseScans = [
      { hrv_value: 82, blink_rate: 18.2, created_at: '2026-11-15T10:00:00Z' },
      { hrv_value: 100, blink_rate: 20.0, created_at: '2026-11-14T10:00:00Z' },
      { hrv_value: 110, blink_rate: 22.0, created_at: '2026-11-13T10:00:00Z' },
    ];

    it('busca stress_scans do usuario com colunas, ordem desc e limite 30 quando initialScans nao e passado', async () => {
      // Arrange
      mockLimit.mockResolvedValue({ data: supabaseScans });

      // Act
      await act(async () => {
        render(<MissionLog />);
      });

      // Assert
      expect(mockFrom).toHaveBeenCalledWith('stress_scans');
      expect(mockSelect).toHaveBeenCalledWith('hrv_value, blink_rate, created_at');
      expect(mockSelectEq).toHaveBeenCalledWith('user_id', 'astronaut-001');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockLimit).toHaveBeenCalledWith(30);
    });

    it('mantem "Carregando..." ate a query de stress_scans terminar', async () => {
      // Arrange: query pendente
      let resolveScans: (value: unknown) => void = () => {};
      mockLimit.mockReturnValue(
        new Promise((resolve) => {
          resolveScans = resolve;
        })
      );

      // Act
      await act(async () => {
        render(<MissionLog />);
      });

      // Assert: ainda carregando
      expect(screen.getAllByText('Carregando...').length).toBeGreaterThan(0);
      expect(screen.queryByText(/Linha de base em construção/)).not.toBeInTheDocument();

      // Act: finaliza a query
      await act(async () => {
        resolveScans({ data: supabaseScans });
      });

      // Assert: delta exibido apos o carregamento
      await waitFor(() => {
        expect(screen.getByText('−22% vs. sua linha de base')).toBeInTheDocument();
      });
    });

    it('com 3 ou mais scans do Supabase exibe o delta percentual', async () => {
      // Arrange
      mockLimit.mockResolvedValue({ data: supabaseScans });

      // Act
      await act(async () => {
        render(<MissionLog />);
      });

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Base: 105 ms')).toBeInTheDocument();
      });
      expect(screen.getByText('−22% vs. sua linha de base')).toBeInTheDocument();
      expect(screen.getByText('−13% vs. sua linha de base')).toBeInTheDocument();
    });

    it('com menos de 3 scans do Supabase exibe "Linha de base em construção (2/3 scans)"', async () => {
      // Arrange
      mockLimit.mockResolvedValue({ data: supabaseScans.slice(0, 2) });

      // Act
      await act(async () => {
        render(<MissionLog />);
      });

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Linha de base em construção (2/3 scans)')).toBeInTheDocument();
      });
      expect(screen.queryByText(/vs. sua linha de base/)).not.toBeInTheDocument();
    });
  });

  describe('7. Sintomas hoje e Apoio à Decisão (AAA)', () => {
    it('renderiza todos os 8 chips selecionáveis de texto sem emojis', async () => {
      // Arrange & Act
      await act(async () => {
        render(<MissionLog />);
      });

      // Assert
      expect(screen.getByText('Sintomas hoje')).toBeInTheDocument();
      SYMPTOM_OPTIONS.forEach((symptom) => {
        const chip = screen.getByRole('button', { name: symptom });
        expect(chip).toBeInTheDocument();
        expect(chip).toHaveAttribute('aria-pressed', 'false');
        // Não contém emojis conhecidos
        expect(chip.textContent).not.toMatch(
          /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u
        );
      });
    });

    it('exibe sempre "Apoio à decisão, não diagnóstico" mesmo sem sintomas ou sem recomendação', async () => {
      // Arrange & Act
      await act(async () => {
        render(<MissionLog cockpitVerdict="GO" />);
      });

      // Assert
      expect(screen.getByText(DECISION_SUPPORT_DISCLAIMER)).toBeInTheDocument();
      expect(screen.queryByText(DECISION_SUPPORT_RECOMMENDATION)).not.toBeInTheDocument();
    });

    it('limite de 1 sintoma com NO-GO: não exibe recomendação', async () => {
      // Arrange
      await act(async () => {
        render(<MissionLog cockpitVerdict="NO-GO" />);
      });

      const chip = screen.getByRole('button', { name: 'dor de cabeça' });

      // Act
      await act(async () => {
        fireEvent.click(chip);
      });

      // Assert
      expect(chip).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText(DECISION_SUPPORT_DISCLAIMER)).toBeInTheDocument();
      expect(screen.queryByText(DECISION_SUPPORT_RECOMMENDATION)).not.toBeInTheDocument();
    });

    it('2 sintomas com veredito NO-GO: exibe linha neutra de recomendação para Cirurgião de Voo', async () => {
      // Arrange
      await act(async () => {
        render(<MissionLog cockpitVerdict="NO-GO" />);
      });

      const chip1 = screen.getByRole('button', { name: 'febre ou calafrios' });
      const chip2 = screen.getByRole('button', { name: 'náusea' });

      // Act
      await act(async () => {
        fireEvent.click(chip1);
        fireEvent.click(chip2);
      });

      // Assert
      expect(chip1).toHaveAttribute('aria-pressed', 'true');
      expect(chip2).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText(DECISION_SUPPORT_RECOMMENDATION)).toBeInTheDocument();
      expect(screen.getByText(DECISION_SUPPORT_DISCLAIMER)).toBeInTheDocument();
    });

    it('2 sintomas com veredito GO: NÃO exibe recomendação', async () => {
      // Arrange
      await act(async () => {
        render(<MissionLog cockpitVerdict="GO" />);
      });

      const chip1 = screen.getByRole('button', { name: 'febre ou calafrios' });
      const chip2 = screen.getByRole('button', { name: 'náusea' });

      // Act
      await act(async () => {
        fireEvent.click(chip1);
        fireEvent.click(chip2);
      });

      // Assert
      expect(screen.queryByText(DECISION_SUPPORT_RECOMMENDATION)).not.toBeInTheDocument();
      expect(screen.getByText(DECISION_SUPPORT_DISCLAIMER)).toBeInTheDocument();
    });

    it('3 sintomas em qualquer veredito (ex: GO): exibe linha neutra de recomendação', async () => {
      // Arrange
      await act(async () => {
        render(<MissionLog cockpitVerdict="GO" />);
      });

      const chip1 = screen.getByRole('button', { name: 'dor de cabeça' });
      const chip2 = screen.getByRole('button', { name: 'tontura' });
      const chip3 = screen.getByRole('button', { name: 'sono fragmentado' });

      // Act
      await act(async () => {
        fireEvent.click(chip1);
        fireEvent.click(chip2);
        fireEvent.click(chip3);
      });

      // Assert
      expect(screen.getByText(DECISION_SUPPORT_RECOMMENDATION)).toBeInTheDocument();
      expect(screen.getByText(DECISION_SUPPORT_DISCLAIMER)).toBeInTheDocument();
    });

    it('salva registro: persiste sintomas no localStorage por data e registra o evento em missionEvents', async () => {
      // Arrange
      await act(async () => {
        render(<MissionLog cockpitVerdict="NO-GO" initialFatigue={2} />);
      });

      const chip1 = screen.getByRole('button', { name: 'febre ou calafrios' });
      const chip2 = screen.getByRole('button', { name: 'náusea' });
      const inputSono = screen.getByLabelText(/Horas de Sono/i);
      const saveButton = screen.getByRole('button', { name: /Salvar Registro/i });

      // Act
      await act(async () => {
        fireEvent.click(chip1);
        fireEvent.click(chip2);
        fireEvent.change(inputSono, { target: { value: '6.5' } });
        fireEvent.click(saveButton);
      });

      // Assert: Sintomas persistidos no localStorage por data
      const savedSymptoms = getDailySymptoms();
      expect(savedSymptoms).toEqual(['febre ou calafrios', 'náusea']);

      const todayKey = getSymptomsStorageKey();
      expect(localStorage.getItem(todayKey)).not.toBeNull();

      // Assert: Evento gravado em missionEvents
      const recentEvents = getRecentEvents();
      expect(recentEvents.length).toBeGreaterThan(0);
      const symptomsEvent = recentEvents.find((e) => e.type === 'symptoms_logged');
      expect(symptomsEvent).toBeDefined();
      expect(symptomsEvent?.title).toBe('Registro de Sintomas');
      expect(symptomsEvent?.metadata?.symptoms).toEqual(['febre ou calafrios', 'náusea']);
      expect(symptomsEvent?.metadata?.decisionSupportTriggered).toBe(true);
    });
  });

  describe('8. Pacote de Downlink (72h) - Modo Autônomo vs Online (AAA)', () => {
    it('renderiza o botão "Gerar Pacote de Downlink" e em modo autônomo atualiza o rótulo para "Pacote salvo localmente (simulação de uplink — nenhum envio real)"', async () => {
      // Arrange
      localStorage.setItem('mars_mission_connection_mode', 'autonomous');

      await act(async () => {
        render(<MissionLog initialFatigue={2} />);
      });

      const downlinkBtn = screen.getByRole('button', { name: /Gerar Pacote de Downlink/i });
      expect(downlinkBtn).toBeInTheDocument();

      // Act
      await act(async () => {
        fireEvent.click(downlinkBtn);
      });

      // Assert
      await waitFor(() => {
        expect(downlinkBtn).toHaveTextContent('Pacote salvo localmente (simulação de uplink — nenhum envio real)');
      });
      expect(localStorage.getItem('mars_downlink_package_status')).toBe('pendente de envio');
      expect(localStorage.getItem('downlink_package_status')).toBe('pendente de envio');
    });

    it('em modo online atualiza o rótulo para "Pacote gerado"', async () => {
      // Arrange
      localStorage.setItem('mars_mission_connection_mode', 'online');

      await act(async () => {
        render(<MissionLog initialFatigue={2} />);
      });

      const downlinkBtn = screen.getByRole('button', { name: /Gerar Pacote de Downlink/i });
      expect(downlinkBtn).toBeInTheDocument();

      // Act
      await act(async () => {
        fireEvent.click(downlinkBtn);
      });

      // Assert
      await waitFor(() => {
        expect(downlinkBtn).toHaveTextContent('Pacote gerado');
      });
      expect(localStorage.getItem('mars_downlink_package_status')).toBe('gerado');
    });

    it('em modo autônomo grava na outbox, confirma uplink pendente e não chama Supabase (AAA)', async () => {
      // Arrange
      clearOutbox();
      localStorage.setItem('mars_mission_connection_mode', 'autonomous');

      await act(async () => {
        render(<MissionLog initialFatigue={2} />);
      });

      const inputSono = screen.getByLabelText(/Horas de Sono/i);
      const inputTreino = screen.getByLabelText(/Exercício Realizado Hoje/i);
      const saveButton = screen.getByRole('button', { name: /Salvar Registro/i });

      // Act
      fireEvent.change(inputSono, { target: { value: '7.5' } });
      fireEvent.change(inputTreino, { target: { value: '45 min esteira ARED' } });

      await act(async () => {
        fireEvent.click(saveButton);
      });

      // Assert
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Registro salvo localmente — será enviado ao restabelecer o uplink',
      });
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(getOutboxCount()).toBe(1);
      const outbox = getOutbox();
      expect(outbox[0].table).toBe('profiles');
      expect(outbox[0].op).toBe('update');
      expect(outbox[0].payload.horas_sono).toBe(7.5);
    });
  });

  describe('10. Sem cockpitVerdict: sem divergencia e sem leitura de readiness (AAA)', () => {
    it('nao exibe divergencia nem chama getReadinessStatus quando cockpitVerdict nao e passado', async () => {
      // Arrange: fadiga 4 seria divergente com GO, mas sem veredito nao ha comparacao
      // Act
      await act(async () => {
        render(<MissionLog stressLevel="low" hrvValue={40} initialFatigue={4} />);
      });

      // Assert
      expect(screen.queryByText(FATIGUE_DIVERGENCE_MESSAGE)).not.toBeInTheDocument();
      expect(getReadinessStatus).not.toHaveBeenCalled();
    });
  });

  describe('11. Utilitarios de formatacao multilíngue (AAA)', () => {
    it('formatLocalizedEventDate formata datas conforme o idioma (Hoje/Today, Ontem/Yesterday e DD/MM vs MM/DD)', () => {
      // Arrange
      const ref = new Date('2026-11-15T12:00:00Z');
      const today = new Date('2026-11-15T09:30:00Z');
      const yesterday = new Date('2026-11-14T18:15:00Z');
      const older = new Date('2026-11-10T14:20:00Z');

      // Act & Assert - PT
      expect(formatLocalizedEventDate(today, 'pt', ref)).toContain('Hoje,');
      expect(formatLocalizedEventDate(yesterday, 'pt', ref)).toContain('Ontem,');
      expect(formatLocalizedEventDate(older, 'pt', ref)).toContain('10/11,');

      // Act & Assert - EN
      expect(formatLocalizedEventDate(today, 'en', ref)).toContain('Today,');
      expect(formatLocalizedEventDate(yesterday, 'en', ref)).toContain('Yesterday,');
      expect(formatLocalizedEventDate(older, 'en', ref)).toContain('11/10,');
    });

    it('formatCockpitVerdict mapeia vereditos em portugues para ingles sem alterar o prop', () => {
      // Arrange & Act & Assert
      expect(formatCockpitVerdict('ATENÇÃO', 'en')).toBe('CAUTION - WATCH');
      expect(formatCockpitVerdict('ATENÇÃO', 'pt')).toBe('ATENÇÃO');
      expect(formatCockpitVerdict('GO', 'en')).toBe('GO - FIT FOR SHIFT');
      expect(formatCockpitVerdict('GO', 'pt')).toBe('GO');
      expect(formatCockpitVerdict('NO-GO', 'en')).toBe('NO-GO - FATIGUE (NOT FIT)');
      expect(formatCockpitVerdict('NO-GO', 'pt')).toBe('NO-GO');
      expect(formatCockpitVerdict('AGUARDANDO SCAN', 'en')).toBe('AWAITING SCAN');
      expect(formatCockpitVerdict('AGUARDANDO SCAN', 'pt')).toBe('AGUARDANDO SCAN');
      expect(formatCockpitVerdict('SEM DADOS', 'en')).toBe('NO DATA');
      expect(formatCockpitVerdict('SEM DADOS', 'pt')).toBe('SEM DADOS');
    });

    it('formatEventText deriva eventos em EN a partir de type + metadata mantendo fallback em PT', () => {
      // Arrange
      const mockT = (key: string, vars?: Record<string, string | number>) => {
        if (key === 'missionlog.event.scanCompleted') {
          return `Scan completed: BioScore ${vars?.score}, HRV ${vars?.hrv} ms`;
        }
        if (key === 'missionlog.event.fatigueLogged') {
          return `Perceived fatigue: ${vars?.level}`;
        }
        if (key === 'missionlog.event.symptomsReported') {
          return `Symptoms reported: ${vars?.list}`;
        }
        if (key === 'missionlog.symptom.fever') return 'fever or chills';
        if (key === 'missionlog.symptom.headache') return 'headache';
        if (key === 'missionlog.fatigue.3') return '3 - Moderate fatigue';
        return key;
      };

      const scanEvt = {
        id: '1',
        type: 'scan',
        label: 'Scan realizado: BioScore 72, HRV 62 ms',
        at: '2026-11-15T10:00:00Z',
        metadata: { score: 72, hrv: 62 },
      };

      const fatigueEvt = {
        id: '2',
        type: 'perceived_fatigue',
        label: 'Fadiga percebida: 3 - Fadiga moderada',
        at: '2026-11-15T10:05:00Z',
        metadata: { fadiga: 3 },
      };

      const symptomsEvt = {
        id: '3',
        type: 'symptoms_logged',
        label: 'Sintomas reportados: febre ou calafrios, dor de cabeça',
        at: '2026-11-15T10:10:00Z',
        metadata: { symptoms: ['febre ou calafrios', 'dor de cabeça'] },
      };

      const customEvt = {
        id: '4',
        type: 'custom_alert',
        label: 'Custom alert text',
        at: '2026-11-15T10:15:00Z',
      };

      // Assert - PT preserva label original
      expect(formatEventText(scanEvt, 'pt', mockT)).toBe('Scan realizado: BioScore 72, HRV 62 ms');
      expect(formatEventText(fatigueEvt, 'pt', mockT)).toBe('Fadiga percebida: 3 - Fadiga moderada');
      expect(formatEventText(symptomsEvt, 'pt', mockT)).toBe('Sintomas reportados: febre ou calafrios, dor de cabeça');

      // Assert - EN deriva dinamicamente
      expect(formatEventText(scanEvt, 'en', mockT)).toBe('Scan completed: BioScore 72, HRV 62 ms');
      expect(formatEventText(fatigueEvt, 'en', mockT)).toBe('Perceived fatigue: 3 - Moderate fatigue');
      expect(formatEventText(symptomsEvt, 'en', mockT)).toBe('Symptoms reported: fever or chills, headache');
      expect(formatEventText(customEvt, 'en', mockT)).toBe('Custom alert text');
    });
  });

  describe('12. Componente MissionLog sob LangProvider (EN e PT) (AAA)', () => {
    it('renderiza todos os textos principais em Ingles quando sob LangProvider initialLang="en"', async () => {
      // Arrange & Act
      await act(async () => {
        render(
          <LangProvider initialLang="en">
            <MissionLog cockpitVerdict="ATENÇÃO" />
          </LangProvider>
        );
      });

      // Assert: Títulos e rótulos em inglês
      expect(screen.getByRole('heading', { level: 3, name: 'Biometric Log' })).toBeInTheDocument();
      expect(screen.getByLabelText(/Sleep Hours/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Exercise Completed Today/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Perceived Fatigue Level/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save Entry' })).toBeInTheDocument();
      expect(screen.getByText('Symptoms today')).toBeInTheDocument();
      expect(screen.getByText('Personal Baseline')).toBeInTheDocument();
      expect(screen.getByText('Last Saved Entry')).toBeInTheDocument();
      expect(screen.getByText('Downlink Package')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Generate Downlink Package' })).toBeInTheDocument();
      expect(screen.getByText('Mission Event Timeline')).toBeInTheDocument();

      // Assert: Veredito do Cockpit traduzido
      const verdictBadge = screen.getByTestId('cockpit-verdict-badge');
      expect(verdictBadge).toHaveTextContent('CAUTION - WATCH');

      // Assert: Textos antigos em português NÃO aparecem no DOM
      expect(screen.queryByText('Horas de Sono')).toBeNull();
      expect(screen.queryByText('Exercício Realizado Hoje')).toBeNull();
      expect(screen.queryByText('Salvar Registro')).toBeNull();
      expect(screen.queryByText('Linha de Base Pessoal')).toBeNull();
      expect(screen.queryByText('Último Registro Salvo')).toBeNull();
      expect(screen.queryByText('Pacote de Downlink')).toBeNull();
      expect(screen.queryByText('Gerar Pacote de Downlink')).toBeNull();
      expect(screen.queryByText('Linha do Tempo da Missão')).toBeNull();
      expect(screen.queryByText('ATENÇÃO')).toBeNull();
    });

    it('renderiza todos os textos em Portugues quando sob LangProvider initialLang="pt"', async () => {
      // Arrange & Act
      await act(async () => {
        render(
          <LangProvider initialLang="pt">
            <MissionLog cockpitVerdict="ATENÇÃO" />
          </LangProvider>
        );
      });

      // Assert: Títulos e rótulos em português
      expect(screen.getByLabelText(/Horas de Sono/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Exercício Realizado Hoje/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Salvar Registro' })).toBeInTheDocument();
      expect(screen.getByText('Linha de Base Pessoal')).toBeInTheDocument();
      expect(screen.getByText('Último Registro Salvo')).toBeInTheDocument();
      expect(screen.getByText('Pacote de Downlink')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Gerar Pacote de Downlink' })).toBeInTheDocument();
      expect(screen.getByText('Linha do Tempo da Missão')).toBeInTheDocument();

      // Assert: Veredito do Cockpit em português
      const verdictBadge = screen.getByTestId('cockpit-verdict-badge');
      expect(verdictBadge).toHaveTextContent('ATENÇÃO');
    });

    it('filtra eventos na timeline por tipo e formata em EN dinamicamente', async () => {
      // Arrange
      appendEvent({
        type: 'scan',
        label: 'Scan realizado: BioScore 72, HRV 62 ms',
        metadata: { score: 72, hrv: 62 },
      });
      appendEvent({
        type: 'perceived_fatigue',
        label: 'Fadiga percebida: 3 - Fadiga moderada',
        metadata: { fadiga: 3 },
      });

      // Act
      await act(async () => {
        render(
          <LangProvider initialLang="en">
            <MissionLog />
          </LangProvider>
        );
      });

      // Assert: Eventos renderizados em EN
      expect(screen.getByText('Scan completed: BioScore 72, HRV 62 ms')).toBeInTheDocument();
      expect(screen.getByText('Perceived fatigue: 3 - Moderate fatigue')).toBeInTheDocument();

      // Act: Clica no filtro "Scans"
      const scanFilterBtn = screen.getByRole('button', { name: 'Scans' });
      await act(async () => {
        fireEvent.click(scanFilterBtn);
      });

      // Assert: Apenas scan visivel
      expect(screen.getByText('Scan completed: BioScore 72, HRV 62 ms')).toBeInTheDocument();
      expect(screen.queryByText('Perceived fatigue: 3 - Moderate fatigue')).toBeNull();
    });
  });
});
