import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import MiniMeditation from './MiniMeditation';

describe('MiniMeditation - Cockpit Sóbrio NASA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock SpeechSynthesis
    const mockSpeechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn().mockReturnValue([]),
    };
    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSpeechSynthesis,
      writable: true,
      configurable: true,
    });
    // Mock SpeechSynthesisUtterance
    class MockUtterance {
      text: string;
      lang = 'pt-BR';
      rate = 0.9;
      pitch = 1.0;
      constructor(text: string) {
        this.text = text;
      }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: MockUtterance,
      writable: true,
      configurable: true,
    });
  });

  it('não renderiza nada quando trigger for false', () => {
    // Arrange & Act
    const { container } = render(<MiniMeditation trigger={false} />);

    // Assert
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza o protocolo com padrão sóbrio de cockpit e sem emojis', () => {
    // Arrange & Act
    render(<MiniMeditation trigger={true} />);

    // Assert
    expect(screen.getByText('Protocolo de Respiração Guiada (3min)')).toBeInTheDocument();
    expect(screen.getByText(/Técnica 4-4-6: Inspire 4s, segure 4s, expire 6s/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Protocolo/i })).toBeInTheDocument();

    // Zero emojis de meditação ou lâmpada
    expect(screen.queryByText(/🧘/)).not.toBeInTheDocument();
    expect(screen.queryByText(/💡/)).not.toBeInTheDocument();
    expect(screen.queryByText(/⚠️/)).not.toBeInTheDocument();
  });

  it('executa fases de respiração exibindo numeração e passos sem emojis anatômicos', async () => {
    // Arrange
    render(<MiniMeditation trigger={true} />);
    const startButton = screen.getByRole('button', { name: /Iniciar Protocolo/i });

    // Act
    await act(async () => {
      fireEvent.click(startButton);
    });

    // Assert
    expect(screen.getByText('Fase 1/3: Inalação (4s)')).toBeInTheDocument();
    expect(screen.getByText('Inspire fundo pelo nariz')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pausar Protocolo/i })).toBeInTheDocument();

    // Verificação de ausência de emojis de respiração
    expect(screen.queryByText(/👃/)).not.toBeInTheDocument();
    expect(screen.queryByText(/🫁/)).not.toBeInTheDocument();
    expect(screen.queryByText(/😮‍💨/)).not.toBeInTheDocument();
  });
});
