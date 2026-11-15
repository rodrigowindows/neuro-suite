import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MissionStatusWidget from './MissionStatusWidget';

describe('MissionStatusWidget Component', () => {
  it('renderiza "Status da Missão: Aguardando scan" quando state="unknown"', () => {
    // Arrange & Act
    render(<MissionStatusWidget state="unknown" />);

    // Assert
    const statusText = screen.getByTestId('mission-status-text');
    const indicator = screen.getByTestId('mission-status-indicator');

    expect(statusText).toHaveTextContent('Status da Missão: Aguardando scan');
    expect(statusText).toHaveClass('text-xs', 'font-mono', 'text-muted-foreground');
    expect(indicator).toHaveClass('bg-muted-foreground/60');
    expect(indicator).not.toHaveClass('bg-emerald-500', 'bg-destructive', 'bg-amber-500');
  });

  it('renderiza "Status da Missão: Atenção" em tom âmbar quando state="caution"', () => {
    // Arrange & Act
    render(<MissionStatusWidget state="caution" />);

    // Assert
    const statusText = screen.getByTestId('mission-status-text');
    const indicator = screen.getByTestId('mission-status-indicator');

    expect(statusText).toHaveTextContent('Status da Missão: Atenção');
    expect(statusText).toHaveClass('text-xs', 'font-mono', 'text-amber-500');
    expect(indicator).toHaveClass('bg-amber-500');
    expect(indicator).not.toHaveClass('bg-destructive', 'bg-emerald-500');
  });

  it('renderiza "Atenção: Fadiga Detectada" em tom destrutivo quando state="nogo"', () => {
    // Arrange & Act
    render(<MissionStatusWidget state="nogo" />);

    // Assert
    const statusText = screen.getByTestId('mission-status-text');
    const indicator = screen.getByTestId('mission-status-indicator');

    expect(statusText).toHaveTextContent('Atenção: Fadiga Detectada');
    expect(statusText).toHaveClass('text-xs', 'font-mono', 'text-destructive');
    expect(indicator).toHaveClass('bg-destructive');
    expect(indicator).not.toHaveClass('bg-emerald-500', 'animate-pulse');
  });

  it('renderiza "Status da Missão: Nominal" quando state="go"', () => {
    // Arrange & Act
    render(<MissionStatusWidget state="go" />);

    // Assert
    const statusText = screen.getByTestId('mission-status-text');
    const indicator = screen.getByTestId('mission-status-indicator');

    expect(statusText).toHaveTextContent('Status da Missão: Nominal');
    expect(statusText).toHaveClass('text-xs', 'font-mono', 'text-emerald-500');
    expect(indicator).toHaveClass('bg-emerald-500');
    expect(indicator).not.toHaveClass('animate-pulse', 'bg-destructive');
  });

  it('exibe o selo de demonstração apenas quando isDemo e stageBadge estão presentes', () => {
    // Arrange & Act
    render(<MissionStatusWidget state="nogo" isDemo stageBadge="DEMO 1/3" label="NO-GO" />);

    // Assert
    expect(screen.getByTestId('mission-status-stage')).toHaveTextContent('DEMO 1/3');
    expect(screen.getByTestId('mission-status-widget')).toHaveAttribute('title', 'NO-GO');
  });

  it('não exibe selo de demonstração fora do modo demo', () => {
    // Arrange & Act
    render(<MissionStatusWidget state="go" stageBadge="DEMO 3/3" />);

    // Assert
    expect(screen.queryByTestId('mission-status-stage')).not.toBeInTheDocument();
  });
});
