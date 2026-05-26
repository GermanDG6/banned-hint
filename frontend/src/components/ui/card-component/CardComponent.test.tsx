import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardComponent } from './CardComponent';

describe('CardComponent', () => {
  it('should render skeletons when loading is true', () => {
    const { container } = render(
      <CardComponent word="Test" bannedWords={['word1', 'word2']} loading={true} />
    );

    const card = container.querySelector('[aria-label="Cargando carta"]');
    expect(card).toHaveAttribute('aria-busy', 'true');
  });

  it('should render the word when loading is false', () => {
    render(
      <CardComponent word="Python" bannedWords={['code', 'snake']} loading={false} />
    );

    expect(screen.getByText('PYTHON')).toBeInTheDocument();
  });

  it('should render all banned words', () => {
    const bannedWords = ['code', 'snake', 'animal', 'reptile'];

    render(
      <CardComponent word="Python" bannedWords={bannedWords} loading={false} />
    );

    bannedWords.forEach((word) => {
      expect(screen.getByText(word)).toBeInTheDocument();
    });
  });

  it('should have aria-label on banned words list', () => {
    render(
      <CardComponent word="Python" bannedWords={['code', 'snake']} loading={false} />
    );

    expect(screen.getByLabelText('Palabras prohibidas')).toBeInTheDocument();
  });
});

