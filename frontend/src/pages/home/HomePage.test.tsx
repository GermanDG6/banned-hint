import { render, screen, fireEvent } from '@testing-library/react';
import { HomePage } from './HomePage';
import { vi } from 'vitest';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('HomePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the app title', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: 'BANNED HINT' })).toBeInTheDocument();
  });

  it('renders the subtitle describing the game objective', () => {
    render(<HomePage />);
    expect(
      screen.getByText('¿Puedes describir la palabra sin usar las pistas prohibidas?'),
    ).toBeInTheDocument();
  });

  it('renders the MODO LOCAL button', () => {
    render(<HomePage />);
    expect(screen.getByRole('button', { name: /MODO LOCAL/i })).toBeInTheDocument();
  });

  it('renders the MODO SALA button', () => {
    render(<HomePage />);
    expect(screen.getByRole('button', { name: /MODO SALA/i })).toBeInTheDocument();
  });

  it('navigates to /local/setup when MODO LOCAL button is clicked', () => {
    render(<HomePage />);
    const localButton = screen.getByRole('button', { name: /MODO LOCAL/i });

    fireEvent.click(localButton);

    expect(mockNavigate).toHaveBeenCalledWith('/local/setup');
  });

  it('navigates to /lobby/new when MODO SALA button is clicked', () => {
    render(<HomePage />);
    const lobbyButton = screen.getByRole('button', { name: /MODO SALA/i });

    fireEvent.click(lobbyButton);

    expect(mockNavigate).toHaveBeenCalledWith('/lobby/new');
  });

  it('both mode buttons are always enabled', () => {
    render(<HomePage />);
    const localButton = screen.getByRole('button', { name: /MODO LOCAL/i }) as HTMLButtonElement;
    const lobbyButton = screen.getByRole('button', { name: /MODO SALA/i }) as HTMLButtonElement;

    expect(localButton.disabled).toBe(false);
    expect(lobbyButton.disabled).toBe(false);
  });
});
