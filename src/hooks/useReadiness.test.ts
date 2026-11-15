import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useReadiness } from './useReadiness';
import { supabase } from '@/integrations/supabase/client';
import { useWellnessScore } from '@/hooks/useWellnessScore';
import {
  registerCountermeasureProtocol,
  clearCountermeasureProtocolToday,
  hasCountermeasureProtocolToday,
} from '@/lib/missionEvents';
import { resetDemoStage, setStoredDemoStage } from '@/lib/demoScenario';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-astronaut-001', email: 'astronaut@mission.org' },
    loading: false,
    signOut: vi.fn(),
  })),
}));

vi.mock('@/hooks/useWellnessScore', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useWellnessScore')>()),
  useWellnessScore: vi.fn(() => ({
    score: null,
    loading: false,
  })),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-astronaut-001' } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    }),
  },
}));

describe('useReadiness Hook - 3 Etapas Demo, Reset, Ausência Total e Consistência', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCountermeasureProtocolToday();
    sessionStorage.clear();
    localStorage.clear();
    resetDemoStage();
    window.history.pushState({}, '', '/');
    vi.mocked(useWellnessScore).mockReturnValue({
      score: null,
      loading: false,
    });
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    } as any);
  });

  describe('Ausência total sem a flag demo', () => {
    it('sem ?demo=1 nenhum estado demo existe e nenhum dado real é sobrescrito', async () => {
      // Arrange: URL comum sem ?demo=1, DB retorna nulo (sem scan)
      window.history.pushState({}, '', '/dashboard');

      // Act
      const { result } = renderHook(() => useReadiness());

      // Assert
      await waitFor(() => {
        expect(result.current.isDemo).toBe(false);
      });
      expect(result.current.demoStage).toBeNull();
      expect(result.current.demoStageLabel).toBeNull();
      expect(result.current.stageBadge).toBeNull();
      expect(result.current.logs).toHaveLength(0);
      expect(result.current.state).toBe('unknown');
      expect(['SEM DADOS', 'AGUARDANDO SCAN']).toContain(result.current.label);
      expect(result.current.isUnknown).toBe(true);
      expect(result.current.isAlert).toBe(false);
      expect(result.current.isCaution).toBe(false);
    });

    it('em ambiente real com telemetria preserva medições do banco sem interferência de demo', async () => {
      // Arrange: DB retorna medições saudáveis reais
      vi.mocked(useWellnessScore).mockReturnValue({ score: 90, loading: false });
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'stress_scans') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                stress_level: 'low',
                hrv_value: 65,
                blink_rate: 16.5,
              },
            }),
          } as any;
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { horas_sono: 8 } }),
        } as any;
      });

      // Act
      const { result } = renderHook(() => useReadiness());

      // Assert
      await waitFor(() => {
        expect(result.current.state).toBe('go');
      });
      expect(result.current.label).toBe('GO');
      expect(result.current.isDemo).toBe(false);
      expect(result.current.hasRealTelemetry).toBe(true);
      expect(result.current.bioScore).toBe(90);
      expect(result.current.blinkRate).toBe(16.5);
      expect(result.current.horasSono).toBe(8);
      expect(result.current.hrvValue).toBe(65);
    });
  });

  describe('As 3 Etapas Interativas com ?demo=1', () => {
    it('Etapa 1: NO-GO (BioScore 34, 14 piscadas, 5.5h sono, HRV 28) com selo DEMO 1/3 e alerta ativo', async () => {
      // Arrange: URL ativa com ?demo=1 e ausência de scan manual
      window.history.pushState({}, '', '/dashboard?demo=1');

      // Act
      const { result } = renderHook(() => useReadiness());

      // Assert
      await waitFor(() => {
        expect(result.current.isDemo).toBe(true);
      });
      expect(result.current.demoStage).toBe(1);
      expect(result.current.demoStageLabel).toBe('DEMO 1/3');
      expect(result.current.stageBadge).toBe('DEMO 1/3');
      expect(result.current.state).toBe('nogo');
      expect(result.current.label).toBe('NO-GO');
      expect(result.current.headline).toBe('FADIGA — NÃO APTO AO TURNO');
      expect(result.current.bioScore).toBe(34);
      expect(result.current.blinkRate).toBe(14);
      expect(result.current.horasSono).toBe(5.5);
      expect(result.current.hrvValue).toBe(28);
      expect(result.current.stressLevel).toBe('high');
      expect(result.current.isAlert).toBe(true);
      expect(result.current.isCaution).toBe(false);
      expect(result.current.isUnknown).toBe(false);
      expect(result.current.logs).toHaveLength(1);
      expect(result.current.logs[0].timeRelative).toBe('[há 10 min]');
    });

    it('Transição para Etapa 2: ao registrar protocolo (crewvitals:countermeasure-registered) passa para ATENÇÃO com selo DEMO 2/3', async () => {
      // Arrange: Iniciado na etapa 1 com ?demo=1
      window.history.pushState({}, '', '/dashboard?demo=1');
      const { result } = renderHook(() => useReadiness());

      await waitFor(() => {
        expect(result.current.demoStage).toBe(1);
      });

      // Act: Dispara evento oficial de registro de contramedida
      act(() => {
        registerCountermeasureProtocol({ breathing: true });
      });

      // Assert: Avança para Etapa 2 (ATENÇÃO)
      await waitFor(() => {
        expect(result.current.demoStage).toBe(2);
      });
      expect(result.current.demoStageLabel).toBe('DEMO 2/3');
      expect(result.current.stageBadge).toBe('DEMO 2/3');
      expect(result.current.state).toBe('caution');
      expect(result.current.label).toBe('ATENÇÃO');
      expect(result.current.headline).toBe('VIGILÂNCIA OPERACIONAL RECOMENDADA');
      expect(result.current.isCaution).toBe(true);
      expect(result.current.isAlert).toBe(false);
      expect(result.current.logs).toHaveLength(2);
      expect(result.current.logs[1].timeRelative).toBe('[há 2 min]');
    });

    it('Transição para Etapa 3: após scan simulado (simulateScan) passa para GO (BioScore 72, HRV 62) com selo DEMO 3/3', async () => {
      // Arrange: Estando na etapa 2 com ?demo=1
      window.history.pushState({}, '', '/dashboard?demo=1');
      setStoredDemoStage(2);
      const { result } = renderHook(() => useReadiness());

      await waitFor(() => {
        expect(result.current.demoStage).toBe(2);
      });

      // Act: Aciona o scan simulado (simulando clique em Atualizar scan em modo demo)
      act(() => {
        result.current.simulateScan();
      });

      // Assert: Avança para Etapa 3 (GO) com valores exatos requeridos
      await waitFor(() => {
        expect(result.current.demoStage).toBe(3);
      });
      expect(result.current.demoStageLabel).toBe('DEMO 3/3');
      expect(result.current.stageBadge).toBe('DEMO 3/3');
      expect(result.current.state).toBe('go');
      expect(result.current.label).toBe('GO');
      expect(result.current.headline).toBe('APTO PARA O TURNO');
      expect(result.current.bioScore).toBe(72);
      expect(result.current.hrvValue).toBe(62);
      expect(result.current.isAlert).toBe(false);
      expect(result.current.isCaution).toBe(false);
      expect(result.current.logs).toHaveLength(3);
      expect(result.current.logs[2].timeRelative).toBe('[agora]');
    });
  });

  describe('Veredito fisiológico (não depende de engajamento)', () => {
    it('tripulante novo sem histórico, estresse moderado e HRV 60 resulta em ATENÇÃO (não NO-GO)', async () => {
      // Arrange: BioScore 44 (sem streak) não pode decidir o veredito; estresse moderate + HRV 60 decidem
      vi.mocked(useWellnessScore).mockReturnValue({ score: 44, loading: false } as any);
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'stress_scans') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: { stress_level: 'moderate', hrv_value: 60, blink_rate: 16 },
            }),
          } as any;
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null }),
        } as any;
      });

      // Act
      const { result } = renderHook(() => useReadiness());

      // Assert
      await waitFor(() => {
        expect(result.current.hasRealTelemetry).toBe(true);
      });
      expect(result.current.state).toBe('caution');
      expect(result.current.label).toBe('ATENÇÃO');
      expect(result.current.isAlert).toBe(false);
    });
  });

  describe('Reset do Cenário Demo (?demo=reset)', () => {
    it('limpa estágio de sessão quando ?demo=reset na URL e restaura etapa 1 com ?demo=1', async () => {
      // Arrange: Estágio avançado (etapa 3)
      setStoredDemoStage(3);
      window.history.pushState({}, '', '/dashboard?demo=reset');

      // Act 1: Sem ?demo=1, o reset limpa a sessão e desativa demo
      const { result: resReset } = renderHook(() => useReadiness());
      expect(sessionStorage.getItem('crewvitals_demo_stage')).toBeNull();
      expect(resReset.current.isDemo).toBe(false);

      // Act 2: Com ?demo=1&reset=1, reinicia na etapa 1
      window.history.pushState({}, '', '/dashboard?demo=1&reset=1');
      const { result: resDemoReset } = renderHook(() => useReadiness());
      await waitFor(() => {
        expect(resDemoReset.current.demoStage).toBe(1);
      });
      expect(resDemoReset.current.isDemo).toBe(true);
      expect(resDemoReset.current.stageBadge).toBe('DEMO 1/3');
    });

    it('?demo=reset limpa o protocolo registrado hoje', () => {
      // Arrange
      registerCountermeasureProtocol({ breathing: true });
      window.history.pushState({}, '', '/dashboard?demo=reset');

      // Act
      renderHook(() => useReadiness());

      // Assert
      expect(hasCountermeasureProtocolToday()).toBe(false);
    });
  });

  describe('Demo sem estado salvo ignora protocolo gravado antes', () => {
    it('?demo=1 com protocolo no localStorage e sessionStorage vazio: hasProtocolToday false e etapa 1', async () => {
      // Arrange
      registerCountermeasureProtocol({ breathing: true });
      window.history.pushState({}, '', '/dashboard?demo=1');

      // Act
      const { result } = renderHook(() => useReadiness());

      // Assert
      await waitFor(() => {
        expect(result.current.isDemo).toBe(true);
      });
      expect(result.current.hasProtocolToday).toBe(false);
      expect(result.current.demoStage).toBe(1);
      expect(result.current.state).toBe('nogo');
    });
  });

  describe('Consistência Header = Cockpit', () => {
    it('garante que as flags de estado coincidem exatamente com o semáforo de prontidão em cada etapa', async () => {
      // Arrange: Testa as 3 etapas
      window.history.pushState({}, '', '/dashboard?demo=1');
      const { result } = renderHook(() => useReadiness());

      // Etapa 1
      expect(result.current.state).toBe('nogo');
      expect(result.current.isAlert).toBe(true);
      expect(result.current.isCaution).toBe(false);

      // Etapa 2
      act(() => {
        result.current.setStage(2);
      });
      expect(result.current.state).toBe('caution');
      expect(result.current.isCaution).toBe(true);
      expect(result.current.isAlert).toBe(false);

      // Etapa 3
      act(() => {
        result.current.setStage(3);
      });
      expect(result.current.state).toBe('go');
      expect(result.current.isAlert).toBe(false);
      expect(result.current.isCaution).toBe(false);
    });
  });

  describe('BioScore ausente ou zero não altera o veredito fisiológico', () => {
    it('enquanto useWellnessScore carrega (score null) com HRV 60 e estresse moderado mantém ATENÇÃO', () => {
      // Arrange
      vi.mocked(useWellnessScore).mockReturnValue({ score: null, loading: true } as any);

      // Act
      const { result } = renderHook(() =>
        useReadiness({ hrvValue: 60, stressLevel: 'moderate' })
      );

      // Assert
      expect(result.current.bioScore).toBeNull();
      expect(result.current.state).toBe('caution');
      expect(result.current.label).toBe('ATENÇÃO');
    });

    it('após falha de busca (score null) com HRV 28 mantém NO-GO, sem tratar como sem scan', () => {
      // Arrange
      vi.mocked(useWellnessScore).mockReturnValue({ score: null, loading: false } as any);

      // Act
      const { result } = renderHook(() =>
        useReadiness({ hrvValue: 28, stressLevel: 'low' })
      );

      // Assert
      expect(result.current.bioScore).toBeNull();
      expect(result.current.state).toBe('nogo');
      expect(result.current.label).toBe('NO-GO');
    });

    it('scan local com HRV 65 e estresse baixo, sem bioScore, resulta em GO', () => {
      // Arrange
      vi.mocked(useWellnessScore).mockReturnValue({ score: 0, loading: false } as any);

      // Act
      const { result } = renderHook(() =>
        useReadiness({ hrvValue: 65, stressLevel: 'low' })
      );

      // Assert
      expect(result.current.state).toBe('go');
      expect(result.current.label).toBe('GO');
    });
  });
});
