import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameLayout } from './GameLayout';

const noop = () => {};

describe('GameLayout', () => {
  it('should render children', () => {
    render(
      <GameLayout onExit={noop}>
        <p>Test content</p>
      </GameLayout>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render BANNED HINT header', () => {
    render(
      <GameLayout onExit={noop}>
        <p>Content</p>
      </GameLayout>
    );

    expect(screen.getByText('BANNED HINT')).toBeInTheDocument();
  });

  it('should render exit button', () => {
    render(
      <GameLayout onExit={noop}>
        <p>Content</p>
      </GameLayout>
    );

    expect(screen.getByRole('button', { name: /finalizar partida/i })).toBeInTheDocument();
  });

  it('should call onExit when exit button is clicked', async () => {
    const user = userEvent.setup();
    const mockExit = vi.fn();

    render(
      <GameLayout onExit={mockExit}>
        <p>Content</p>
      </GameLayout>
    );

    await user.click(screen.getByRole('button', { name: /finalizar partida/i }));

    expect(mockExit).toHaveBeenCalledTimes(1);
  });
});
