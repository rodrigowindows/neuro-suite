import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MissionStatusWidget from './MissionStatusWidget';

describe('MissionStatusWidget Component', () => {
  it('renderiza "Status da Missão: Sem dados" quando isUnknown={true}', () => {
    // Arrange & Act
    render(<MissionStatusWidget isUnknown={true} />);

    // Assert
    const statusText = screen.getByTestId('mission-status-text');
    const indicator = screen.getByTestId('mission-status-indicator');

    expect(statusText).toBeInTheDocument();
    expect(statusText).toHaveTextContent('Status da Missão: Sem dados');
    expect(statusText).toHaveClass('text-xs', 'font-mono', 'text-muted-foreground');

    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('bg-muted-foreground/60');
    expect(indicator).not.toHaveClass('bg-emerald-500', 'bg-destructive');
  });

  it('renderiza "Atenção: Fadiga Detectada" quando isAlert={true}', () => {
    // Arrange & Act
    render(<MissionStatusWidget isAlert={true} />);

    // Assert
    const statusText = screen.getByTestId('mission-status-text');
    const indicator = screen.getByTestId('mission-status-indicator');

    expect(statusText).toBeInTheDocument();
    expect(statusText).toHaveTextContent('Atenção: Fadiga Detectada');
    expect(statusText).toHaveClass('text-xs', 'font-mono', 'text-destructive');

    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('bg-destructive');
    expect(indicator).not.toHaveClass('bg-emerald-500', 'animate-pulse');
  });

  it('renderiza "Status da Missão: Nominal" no estado padrão', () => {
    // Arrange & Act
    render(<MissionStatusWidget />);

    // Assert
    const statusText = screen.getByTestId('mission-status-text');
    const indicator = screen.getByTestId('mission-status-indicator');

    expect(statusText).toBeInTheDocument();
    expect(statusText).toHaveTextContent('Status da Missão: Nominal');
    expect(statusText).toHaveClass('text-xs', 'font-mono', 'text-emerald-500');

    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('bg-emerald-500');
    expect(indicator).not.toHaveClass('animate-pulse', 'bg-destructive');
  });
});
