import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameCard } from './GameCard';
import { CardMother } from '../../../domain/testing/card.mother';

describe('GameCard', () => {
  it('should show skeleton when loading', () => {
    render(<GameCard card={null} loading={true} />);
    expect(screen.getByLabelText('Cargando carta')).toBeInTheDocument();
  });

  it('should render nothing when not loading and card is null', () => {
    const { container } = render(<GameCard card={null} loading={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render word in uppercase when card is provided', () => {
    const card = CardMother.withWord('marte');
    render(<GameCard card={card} loading={false} />);
    expect(screen.getByText('MARTE')).toBeInTheDocument();
  });

  it('should render all bannedWords when card is provided', () => {
    const card = CardMother.withBannedWords(['Planeta', 'Rojo', 'NASA', 'Solsticio']);
    render(<GameCard card={card} loading={false} />);
    expect(screen.getByText('Planeta')).toBeInTheDocument();
    expect(screen.getByText('Rojo')).toBeInTheDocument();
    expect(screen.getByText('NASA')).toBeInTheDocument();
    expect(screen.getByText('Solsticio')).toBeInTheDocument();
  });

  it('should not render skeleton when card is loaded', () => {
    const card = CardMother.valid();
    render(<GameCard card={card} loading={false} />);
    expect(screen.queryByLabelText('Cargando carta')).not.toBeInTheDocument();
  });
});
