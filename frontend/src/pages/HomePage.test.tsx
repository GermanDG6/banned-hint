import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'BANNED HINT' })).toBeInTheDocument();
  });

  it('renders the subtitle describing the game objective', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(
      screen.getByText('¿Puedes describir la palabra sin usar las pistas prohibidas?'),
    ).toBeInTheDocument();
  });

  it('renders the illustration with correct alt text', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    const image = screen.getByAltText('Ilustración de una persona pensando') as HTMLImageElement;
    expect(image).toBeInTheDocument();
    expect(image.src).toContain('thinking.png');
  });

  it('renders timer label with icon', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Tiempo de la ronda')).toBeInTheDocument();
  });

  it('renders minutes and seconds input fields with default values', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    const minutesInput = screen.getByLabelText('Minutos') as HTMLInputElement;
    const secondsInput = screen.getByLabelText('Segundos') as HTMLInputElement;

    expect(minutesInput).toHaveValue(1);
    expect(secondsInput).toHaveValue(30);
  });

  it('renders the play button', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /¡JUGAR!/i })).toBeInTheDocument();
  });

  it('play button is enabled with default valid timer values', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    const playButton = screen.getByRole('button', { name: /¡JUGAR!/i }) as HTMLButtonElement;
    expect(playButton.disabled).toBe(false);
  });

  it('play button is disabled when both minutes and seconds are 0', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    const minutesInput = screen.getByLabelText('Minutos') as HTMLInputElement;
    const secondsInput = screen.getByLabelText('Segundos') as HTMLInputElement;
    const playButton = screen.getByRole('button', { name: /¡JUGAR!/i }) as HTMLButtonElement;

    fireEvent.change(minutesInput, { target: { value: '0' } });
    fireEvent.change(secondsInput, { target: { value: '0' } });

    expect(playButton.disabled).toBe(true);
  });

  it('restricts seconds input to maximum 59', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    const secondsInput = screen.getByLabelText('Segundos') as HTMLInputElement;

    fireEvent.change(secondsInput, { target: { value: '75' } });

    expect(secondsInput.value).toBe('59');
  });

  it('allows valid seconds values between 0 and 59', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    const secondsInput = screen.getByLabelText('Segundos') as HTMLInputElement;

    fireEvent.change(secondsInput, { target: { value: '45' } });
    expect(secondsInput.value).toBe('45');

    fireEvent.change(secondsInput, { target: { value: '0' } });
    expect(secondsInput.value).toBe('00');

    fireEvent.change(secondsInput, { target: { value: '59' } });
    expect(secondsInput.value).toBe('59');
  });

  it('allows any non-negative minutes value', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    const minutesInput = screen.getByLabelText('Minutos') as HTMLInputElement;

    fireEvent.change(minutesInput, { target: { value: '5' } });
    expect(minutesInput.value).toBe('05');

    fireEvent.change(minutesInput, { target: { value: '0' } });
    expect(minutesInput.value).toBe('00');
  });

  it('navigates to /round when play button is clicked with valid timer', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    const playButton = screen.getByRole('button', { name: /¡JUGAR!/i });

    fireEvent.click(playButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      '/round',
      expect.objectContaining({
        state: { minutes: 1, seconds: 30 },
      }),
    );
  });
});
