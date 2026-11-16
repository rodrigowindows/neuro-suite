import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  assembleDownlinkPackage,
  generateDownlinkPackageAndFiles,
  DOWNLINK_CLINICAL_DISCLAIMER,
  DOWNLINK_PACKAGE_STATUS_KEY,
  calculateScanBioScore,
  getScanVerdict,
} from './downlink';
import { roundBlinkRate } from './biometricDisplay';
import { getFatigueStorageKey } from './perceivedFatigue';

const mockFrom = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'astronaut-001', email: 'pilot@crewvitals.space' } },
      }),
    },
  },
}));

vi.mock('@/components/WellnessReportPDF', () => ({
  buildWellnessReportHtml: vi.fn().mockReturnValue('<html>mock report</html>'),
  openOrDownloadHtmlReport: vi.fn(),
}));

describe('Downlink Service (AAA Pattern)', () => {
  const baseNow = new Date('2026-11-15T12:00:00.000Z');

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    } else {
      vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    }

    if (!window.URL.revokeObjectURL) {
      window.URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});
    }

    vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  describe('1. Conteúdo do JSON (AAA)', () => {
    it('monta o cabeçalho obrigatório com data/hora, versão do app e o aviso clínico legal', async () => {
      // Arrange
      mockFrom.mockImplementation((table: string) => {
        if (table === 'stress_scans') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'daily_checkins') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'coach_conversations') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    full_name: 'Commander Shepard',
                    horas_sono: 7.5,
                    treino_realizado: '45 min esteira ARED',
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });

      // Act
      const pkg = await assembleDownlinkPackage({
        userId: 'astronaut-001',
        now: baseNow,
        hours: 72,
        isAutonomous: false,
      });

      // Assert
      expect(pkg.cabecalho).toBeDefined();
      expect(pkg.cabecalho.data_hora).toBe(baseNow.toISOString());
      expect(pkg.cabecalho.versao_app).toBe('1.0');
      expect(pkg.cabecalho.aviso).toBe(
        'Estimativas por webcam, apoio à decisão, não diagnóstico clínico'
      );
      expect(pkg.aviso).toBe(DOWNLINK_CLINICAL_DISCLAIMER);
    });

    it('consolida vereditos, BioScores, HRV, piscadas com precisão e arredondamento na exibição', async () => {
      // Arrange
      const rawBlinkRate = 18.734;
      const roundedBlink = roundBlinkRate(rawBlinkRate);

      mockFrom.mockImplementation((table: string) => {
        if (table === 'stress_scans') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: [
                      {
                        id: 'scan-001',
                        stress_level: 'low',
                        hrv_value: 68,
                        blink_rate: rawBlinkRate,
                        created_at: '2026-11-15T09:00:00.000Z',
                      },
                      {
                        id: 'scan-002',
                        stress_level: 'high',
                        hrv_value: 26,
                        blink_rate: 28.45,
                        created_at: '2026-11-14T15:00:00.000Z',
                      },
                    ],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    horas_sono: 8,
                    treino_realizado: '60 min ARED',
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        };
      });

      // Act
      const pkg = await assembleDownlinkPackage({
        userId: 'astronaut-001',
        now: baseNow,
        hours: 72,
      });

      // Assert
      expect(pkg.scans).toHaveLength(2);

      const firstScan = pkg.scans[0];
      expect(firstScan.veredito).toBe('Baixo');
      expect(firstScan.bioScore).toBeGreaterThanOrEqual(90);
      expect(firstScan.hrv).toBe(68);
      // Preservação do valor bruto
      expect(firstScan.piscadas).toBe(rawBlinkRate);
      expect(firstScan.blink_rate).toBe(rawBlinkRate);
      // Formatação apenas para exibição
      expect(firstScan.piscadas_exibicao).toBe(roundedBlink);
      expect(firstScan.readiness_status).toBe('GO');

      const secondScan = pkg.scans[1];
      expect(secondScan.veredito).toBe('Alto');
      expect(secondScan.bioScore).toBeLessThanOrEqual(35);
      expect(secondScan.readiness_status).toBe('NO-GO');
    });

    it('consolida sono, exercícios, avaliações de prontidão, fadiga percebida, contramedidas e eventos de log', async () => {
      // Arrange
      const todayKey = getFatigueStorageKey(baseNow);
      localStorage.setItem(
        todayKey,
        JSON.stringify({ value: 3, timestamp: '2026-11-15T08:00:00.000Z' })
      );
      localStorage.setItem(
        'crewvitals_countermeasures_registered_2026-11-15',
        JSON.stringify({
          registeredAt: '2026-11-15T08:30:00.000Z',
          countermeasures: { breathing: true, hydration: true },
        })
      );

      mockFrom.mockImplementation((table: string) => {
        if (table === 'stress_scans') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: [
                      {
                        id: 'scan-001',
                        stress_level: 'moderate',
                        hrv_value: 50,
                        blink_rate: 16.2,
                        created_at: '2026-11-15T07:00:00.000Z',
                      },
                    ],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'daily_checkins') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: [
                      {
                        id: 'checkin-001',
                        mood: 'good',
                        energy_level: 4,
                        created_at: '2026-11-15T07:30:00.000Z',
                      },
                    ],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    horas_sono: 7,
                    treino_realizado: '45 min corrida esteira',
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        };
      });

      // Act
      const pkg = await assembleDownlinkPackage({
        userId: 'astronaut-001',
        now: baseNow,
        hours: 72,
      });

      // Assert
      // 1. Sono
      expect(pkg.sono.horas).toBe(7);
      expect(pkg.sono.texto).toBe('7h');

      // 2. Exercícios
      expect(pkg.exercicios.registro).toBe('45 min corrida esteira');

      // 3. Avaliações de Prontidão
      expect(pkg.avaliacoes_prontidao.length).toBeGreaterThanOrEqual(2);
      expect(pkg.avaliacoes_prontidao[0].rotulo).toBe('ATENÇÃO');

      // 4. Fadiga Percebida
      expect(pkg.fadiga_percebida.valor).toBe(3);
      expect(pkg.fadiga_percebida.rotulo).toBe('3 - Fadiga moderada');

      // 5. Contramedidas Registradas
      expect(pkg.contramedidas_registradas.length).toBeGreaterThanOrEqual(1);
      expect(pkg.contramedidas_registradas[0].detalhes.breathing).toBe(true);

      // 6. Eventos do Log
      expect(pkg.eventos_log.length).toBeGreaterThanOrEqual(3);
      expect(
        pkg.eventos_log.some((e) => e.tipo === 'scan_bioscore')
      ).toBe(true);
      expect(
        pkg.eventos_log.some((e) => e.tipo === 'contramedida')
      ).toBe(true);
    });
  });

  describe('2. Janela de 72 h (AAA)', () => {
    it('inclui estritamente registros dentro das 72 horas e descarta dados anteriores a 72 horas', async () => {
      // Arrange:
      // Agora: 2026-11-15T12:00:00Z
      // Janela 72h: 2026-11-12T12:00:00Z até 2026-11-15T12:00:00Z
      const scanRecent = {
        id: 'scan-within-72h',
        stress_level: 'low',
        hrv_value: 70,
        blink_rate: 14.1,
        created_at: '2026-11-13T10:00:00.000Z', // 48h atrás (válido)
      };
      const scanOld = {
        id: 'scan-outside-72h',
        stress_level: 'high',
        hrv_value: 20,
        blink_rate: 30.5,
        created_at: '2026-11-11T10:00:00.000Z', // 98h atrás (fora da janela)
      };

      const gteSpy = vi.fn();

      mockFrom.mockImplementation((table: string) => {
        if (table === 'stress_scans') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: gteSpy.mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    // Simula retorno contendo scan antigo caso o backend mock não filtre
                    data: [scanRecent, scanOld],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        };
      });

      // Act
      const pkg = await assembleDownlinkPackage({
        userId: 'astronaut-001',
        now: baseNow,
        hours: 72,
      });

      // Assert
      // 1. O filtro na consulta Supabase utilizou a data de corte de 72 horas (2026-11-12T12:00:00.000Z)
      expect(gteSpy).toHaveBeenCalledWith('created_at', '2026-11-12T12:00:00.000Z');

      // 2. O pacote consolidado inclui o scan recente e descarta o scan de 98 horas atrás
      expect(pkg.scans).toHaveLength(1);
      expect(pkg.scans[0].id).toBe('scan-within-72h');
      expect(pkg.scans.some((s) => s.id === 'scan-outside-72h')).toBe(false);
      expect(pkg.janela_horas).toBe(72);
      expect(pkg.inicio_periodo).toBe('2026-11-12T12:00:00.000Z');
      expect(pkg.fim_periodo).toBe(baseNow.toISOString());
    });
  });

  describe('3. Rótulo e Estado: Modo Autônomo vs Online (AAA)', () => {
    it('no Modo Autônomo, rotula como "Pacote salvo localmente (simulação de uplink — nenhum envio real)" e marca "pendente de envio" no localStorage', async () => {
      // Arrange
      localStorage.setItem('mars_mission_connection_mode', 'autonomous');

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }));

      // Act
      const result = await generateDownlinkPackageAndFiles({
        userId: 'astronaut-001',
        now: baseNow,
      });

      // Assert
      // 1. Rótulo informado para modo autônomo
      expect(result.buttonLabel).toBe(
        'Pacote salvo localmente (simulação de uplink — nenhum envio real)'
      );
      expect(result.feedbackMessage).toBe(
        'Pacote salvo localmente (simulação de uplink — nenhum envio real)'
      );

      // 2. Pacote com status pendente de envio
      expect(result.packageData.status).toBe('pendente de envio');
      expect(result.packageData.envio).toBe('simulado');

      // 3. Marcado no localStorage como "pendente de envio"
      expect(localStorage.getItem(DOWNLINK_PACKAGE_STATUS_KEY)).toBe(
        'pendente de envio'
      );
      expect(localStorage.getItem('downlink_package_status')).toBe(
        'pendente de envio'
      );
    });

    it('no Modo Online, rotula como "Pacote gerado" e status "gerado" no localStorage', async () => {
      // Arrange
      localStorage.setItem('mars_mission_connection_mode', 'online');

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }));

      // Act
      const result = await generateDownlinkPackageAndFiles({
        userId: 'astronaut-001',
        now: baseNow,
      });

      // Assert
      // 1. Rótulo informado para modo online
      expect(result.buttonLabel).toBe('Pacote gerado');
      expect(result.feedbackMessage).toBe('Pacote gerado');

      // 2. Pacote com status gerado, sem marcador de simulação
      expect(result.packageData.envio).toBeUndefined();
      expect(result.packageData.status).toBe('gerado');

      // 3. Marcado no localStorage como "gerado"
      expect(localStorage.getItem(DOWNLINK_PACKAGE_STATUS_KEY)).toBe('gerado');
    });

    it('suporta lang="en" e t customizado gerando avisos e labels em inglês', async () => {
      // Arrange
      localStorage.setItem('mars_mission_connection_mode', 'autonomous');

      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }));

      // Act 1: Modo autônomo em inglês
      const resultEn = await generateDownlinkPackageAndFiles({
        userId: 'astronaut-001',
        now: baseNow,
        lang: 'en',
      });

      // Assert 1
      expect(resultEn.buttonLabel).toBe(
        'Package saved locally (simulated uplink — no real transmission)'
      );
      expect(resultEn.packageData.cabecalho.aviso).toBe(
        'Webcam estimates, decision support, not a clinical diagnosis'
      );

      // Act 2: Modo online em inglês
      localStorage.setItem('mars_mission_connection_mode', 'online');
      const resultOnlineEn = await generateDownlinkPackageAndFiles({
        userId: 'astronaut-001',
        now: baseNow,
        lang: 'en',
      });

      // Assert 2
      expect(resultOnlineEn.buttonLabel).toBe('Package generated');
    });
  });
});
