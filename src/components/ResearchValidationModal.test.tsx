import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResearchValidationModal } from './ResearchValidationModal';

describe('ResearchValidationModal Component', () => {
  it('renderiza as 6 linhas de cobertura dos riscos de missão e a frase de apoio à decisão (AAA)', () => {
    // Arrange
    render(<ResearchValidationModal defaultOpen={true} />);

    // Act
    const sectionTitle = screen.getByText('Cobertura dos Riscos de Missão');
    const rows = screen.getAllByRole('row');
    const disclaimerPhrase = screen.getByText(
      'Apoio à decisão do tripulante; não substitui avaliação médica'
    );

    // Assert
    expect(sectionTitle).toBeInTheDocument();
    expect(disclaimerPhrase).toBeInTheDocument();

    // 1 linha de cabeçalho + 6 linhas de indicadores = 7 linhas totais
    expect(rows).toHaveLength(7);

    // Valida os 6 indicadores
    expect(screen.getByText('Fadiga cognitiva e sono')).toBeInTheDocument();
    expect(screen.getByText('Cardiovascular')).toBeInTheDocument();
    expect(screen.getByText('Saúde mental, isolamento e confinamento')).toBeInTheDocument();
    expect(screen.getByText('Perda óssea e muscular')).toBeInTheDocument();
    expect(screen.getByText('Radiação espacial')).toBeInTheDocument();
    expect(screen.getByText('Imunológico')).toBeInTheDocument();

    // Valida o conteúdo exato das fontes e classificações
    expect(
      screen.getByText('piscadas/min estimadas por webcam; horas de sono autorrelatadas.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'HRV estimada por webcam (não validada clinicamente); sem pressão arterial nem ECG.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('avaliação de prontidão (humor/energia) e fadiga percebida.')
    ).toBeInTheDocument();
    expect(screen.getByText('exercício autorrelatado; sem densitometria.')).toBeInTheDocument();
    expect(
      screen.getByText('sem dosímetro; previsto integração com dosímetros de bordo.')
    ).toBeInTheDocument();
    expect(screen.getByText('sintomas')).toBeInTheDocument();
  });

  it('abre o modal através do gatilho por teclado/clique e exibe a tabela acessível', () => {
    // Arrange
    render(<ResearchValidationModal />);
    const trigger = screen.getByRole('button', {
      name: /Base Científica — Research & Validation/i,
    });

    // Act
    fireEvent.click(trigger);

    // Assert
    const tableRegion = screen.getByRole('region', {
      name: /Tabela de Cobertura dos Riscos de Missão/i,
    });
    expect(tableRegion).toBeInTheDocument();
    expect(tableRegion).toHaveAttribute('tabIndex', '0');
  });
});
