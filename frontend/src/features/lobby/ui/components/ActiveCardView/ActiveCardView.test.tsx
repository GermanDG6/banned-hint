import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActiveCardView } from './ActiveCardView';

describe('ActiveCardView', () => {
  it('should render the card word in uppercase', () => {
    const card = {
      id: '1',
      word: 'marte',
      bannedWords: ['planeta', 'rojo', 'espacio', 'nasa'],
    };

    render(<ActiveCardView card={card} />);
    expect(screen.getByText('MARTE')).toBeInTheDocument();
  });

  it('should render all banned words', () => {
    const card = {
      id: '1',
      word: 'gato',
      bannedWords: ['animal', 'felino', 'doméstico', 'bigote'],
    };

    render(<ActiveCardView card={card} />);
    expect(screen.getByText('animal')).toBeInTheDocument();
    expect(screen.getByText('felino')).toBeInTheDocument();
    expect(screen.getByText('doméstico')).toBeInTheDocument();
    expect(screen.getByText('bigote')).toBeInTheDocument();
  });

  it('should render nothing when card is undefined', () => {
    const { container } = render(<ActiveCardView card={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render loading skeleton when loading is true', () => {
    const { container } = render(<ActiveCardView card={undefined} loading={true} />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('should have aria-label on banned words list', () => {
    const card = {
      id: '1',
      word: 'test',
      bannedWords: ['a', 'b', 'c', 'd'],
    };

    render(<ActiveCardView card={card} />);
    expect(screen.getByLabelText('Palabras prohibidas')).toBeInTheDocument();
  });
});
