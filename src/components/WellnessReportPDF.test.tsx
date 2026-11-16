import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WellnessReportPDF from './WellnessReportPDF';
import { LangProvider } from '@/i18n';

// Mock dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'astronaut-001', email: 'pilot@crewvitals.space' },
    session: null,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock('@/hooks/useStressData', () => ({
  useStressData: () => ({
    stats: { lowPercent: 60, moderatePercent: 30, highPercent: 10 },
    trend: { direction: 'improving' },
    consecutiveHighDays: 0,
    loading: false,
    error: null,
    scans: [],
    refresh: vi.fn(),
  }),
}));

const profilesSelectSpy = vi.fn().mockReturnThis();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: profilesSelectSpy,
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              full_name: 'Commander Shepard',
              preferred_name: 'Shepard',
              email: 'pilot@crewvitals.space',
              horas_sono: 8,
              treino_realizado: 'ARED 45min',
            },
            error: null,
          }),
        };
      }
      if (table === 'daily_checkins') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              {
                mood: 'great',
                energy_level: 5,
                created_at: '2026-11-14T10:00:00.000Z',
                ai_response: 'Telemetria nominal',
              },
            ],
            error: null,
          }),
        };
      }
      if (table === 'stress_scans') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              {
                stress_level: 'low',
                hrv_value: 65,
                blink_rate: 15,
                created_at: '2026-11-14T10:00:00.000Z',
              },
            ],
            error: null,
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    }),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('WellnessReportPDF', () => {
  let capturedHtml = '';
  const originalBlob = globalThis.Blob;

  beforeEach(() => {
    capturedHtml = '';
    vi.restoreAllMocks();

    window.open = vi.fn().mockReturnValue({} as Window);

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

    vi.spyOn(globalThis, 'Blob').mockImplementation(function (
      blobParts?: BlobPart[],
      options?: BlobPropertyBag
    ) {
      if (blobParts && typeof blobParts[0] === 'string') {
        capturedHtml = blobParts[0];
      }
      return new originalBlob(blobParts, options);
    });
  });

  it('generates HTML containing the title "Relatório de Telemetria de Saúde da Tripulação"', async () => {
    // Arrange
    render(<WellnessReportPDF />);
    const generateButton = screen.getByRole('button', { name: /Relatório PDF/i });

    // Act
    fireEvent.click(generateButton);

    // Assert
    await waitFor(() => {
      expect(capturedHtml).not.toBe('');
    });
    expect(capturedHtml).toContain('Relatório de Telemetria de Saúde da Tripulação');
    expect(capturedHtml).toContain('<title>Relatório de Telemetria de Saúde da Tripulação - Shepard</title>');
  });

  it('includes the operational support disclaimer in the generated HTML', async () => {
    // Arrange
    render(<WellnessReportPDF />);
    const generateButton = screen.getByRole('button', { name: /Relatório PDF/i });

    // Act
    fireEvent.click(generateButton);

    // Assert
    await waitFor(() => {
      expect(capturedHtml).not.toBe('');
    });
    expect(capturedHtml).toContain(
      'Ferramenta de apoio operacional. Não substitui avaliação médica profissional.'
    );
  });

  it('confirms that Supabase query includes horas_sono and treino_realizado from profiles', async () => {
    // Arrange
    render(<WellnessReportPDF />);
    const generateButton = screen.getByRole('button', { name: /Relatório PDF/i });

    // Act
    fireEvent.click(generateButton);

    // Assert
    await waitFor(() => {
      expect(profilesSelectSpy).toHaveBeenCalled();
    });
    const selectArgs = profilesSelectSpy.mock.calls[0][0];
    expect(selectArgs).toContain('horas_sono');
    expect(selectArgs).toContain('treino_realizado');
  });

  it('renders all required physiological metrics: BioScore, HRV Médio, Horas de Sono, and Log ARED', async () => {
    // Arrange
    render(<WellnessReportPDF />);
    const generateButton = screen.getByRole('button', { name: /Relatório PDF/i });

    // Act
    fireEvent.click(generateButton);

    // Assert
    await waitFor(() => {
      expect(capturedHtml).not.toBe('');
    });
    expect(capturedHtml).toContain('Scans BioScore');
    expect(capturedHtml).toContain('HRV Médio');
    expect(capturedHtml).toContain('Horas de Sono');
    expect(capturedHtml).toContain('8h');
    expect(capturedHtml).toContain('Log de Exercício Físico (ARED / Contra Microgravidade)');
    expect(capturedHtml).toContain('ARED 45min');
  });

  it('ensures absence of the word "Humor" and absence of any mission discipline section', async () => {
    // Arrange
    render(<WellnessReportPDF />);
    const generateButton = screen.getByRole('button', { name: /Relatório PDF/i });

    // Act
    fireEvent.click(generateButton);

    // Assert
    await waitFor(() => {
      expect(capturedHtml).not.toBe('');
    });
    expect(capturedHtml).not.toMatch(/humor/i);
    expect(capturedHtml).not.toMatch(/disciplina/i);
    expect(capturedHtml).not.toMatch(/disciplina de miss[aã]o/i);
  });

  describe('English report generation with LangProvider initialLang="en"', () => {
    it('renders "PDF Report" button and generates report completely translated to English', async () => {
      // Arrange
      render(
        <LangProvider initialLang="en">
          <WellnessReportPDF />
        </LangProvider>
      );
      const generateButton = screen.getByRole('button', { name: /PDF Report/i });
      expect(screen.queryByRole('button', { name: /Relatório PDF/i })).not.toBeInTheDocument();

      // Act
      fireEvent.click(generateButton);

      // Assert
      await waitFor(() => {
        expect(capturedHtml).not.toBe('');
      });

      // English elements present
      expect(capturedHtml).toContain('<html lang="en">');
      expect(capturedHtml).toContain('<title>Crew Health Telemetry Report - Shepard</title>');
      expect(capturedHtml).toContain('<h1>Crew Health Telemetry Report</h1>');
      expect(capturedHtml).toContain('Physiological Metrics and Telemetry (30 days)');
      expect(capturedHtml).toContain('BioScore Scans');
      expect(capturedHtml).toContain('Average HRV');
      expect(capturedHtml).toContain('Sleep Hours (Last Log)');
      expect(capturedHtml).toContain('Average Readiness');
      expect(capturedHtml).toContain('Physical Exercise Log (ARED / Counter Microgravity):');
      expect(capturedHtml).toContain('Load and Fatigue Distribution (30 days)');
      expect(capturedHtml).toContain('Readiness Assessment History (last 15)');
      expect(capturedHtml).toContain(
        'Operational support tool. Does not replace professional medical evaluation.'
      );
      expect(capturedHtml).toContain(
        'CrewVitals by Dark Sector · Zero-Trust Privacy · Period: last 30 days of mission telemetry.'
      );

      // Portuguese elements absent
      expect(capturedHtml).not.toContain('Relatório de Telemetria de Saúde da Tripulação');
      expect(capturedHtml).not.toContain('Métricas Fisiológicas e Telemetria');
      expect(capturedHtml).not.toContain('Ferramenta de apoio operacional');

      // Zero mentions of humor or disciplina
      expect(capturedHtml).not.toMatch(/humor/i);
      expect(capturedHtml).not.toMatch(/disciplina/i);
    });
  });
});
