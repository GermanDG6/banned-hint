import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameLayout } from './GameLayout';

describe('GameLayout', () => {
  it('should render children', () => {
    render(
      <GameLayout>
        <p>Test content</p>
      </GameLayout>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render BANNED HINT header', () => {
    render(
      <GameLayout>
        <p>Content</p>
      </GameLayout>
    );

    expect(screen.getByText('BANNED HINT')).toBeInTheDocument();
  });

  it('should render exit button when provided', () => {
    render(
      <GameLayout exitButton={<button>Exit</button>}>
        <p>Content</p>
      </GameLayout>
    );

    expect(screen.getByRole('button', { name: /exit/i })).toBeInTheDocument();
  });

  it('should not render exit slot when exitButton is not provided', () => {
    render(
      <GameLayout>
        <p>Content</p>
      </GameLayout>
    );

    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });
});


