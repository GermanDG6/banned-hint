import { render, screen, fireEvent } from '@testing-library/react';
import { LocalSetupPage } from './LocalSetupPage';
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

describe('LocalSetupPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the page title', () => {
    render(<LocalSetupPage />);
    expect(screen.getByRole('heading', { name: 'MODO LOCAL' })).toBeInTheDocument();
  });

  it('renders the subtitle describing the timer configuration', () => {
    render(<LocalSetupPage />);
    expect(screen.getByText('Configura el tiempo de la ronda')).toBeInTheDocument();
  });

  it('renders the timer label with icon', () => {
    render(<LocalSetupPage />);
    expect(screen.getByText('Tiempo de la ronda')).toBeInTheDocument();
  });

  it('renders minutes and seconds input fields with default values', () => {
    render(<LocalSetupPage />);
    const minutesInput = screen.getByLabelText('Minutos') as HTMLInputElement;
    const secondsInput = screen.getByLabelText('Segundos') as HTMLInputElement;

    expect(minutesInput).toHaveValue(0);
    expect(secondsInput).toHaveValue(30);
  });

  it('renders the play button', () => {
    render(<LocalSetupPage />);
    expect(screen.getByRole('button', { name: /¡JUGAR!/i })).toBeInTheDocument();
  });

  it('play button is enabled with default valid timer values', () => {
    render(<LocalSetupPage />);
    const playButton = screen.getByRole('button', { name: /¡JUGAR!/i }) as HTMLButtonElement;
    expect(playButton.disabled).toBe(false);
  });

  it('play button is disabled when both minutes and seconds are 0', () => {
    render(<LocalSetupPage />);
    const minutesInput = screen.getByLabelText('Minutos') as HTMLInputElement;
    const secondsInput = screen.getByLabelText('Segundos') as HTMLInputElement;
    const playButton = screen.getByRole('button', { name: /¡JUGAR!/i }) as HTMLButtonElement;

    fireEvent.change(minutesInput, { target: { value: '0' } });
    fireEvent.change(secondsInput, { target: { value: '0' } });

    expect(playButton.disabled).toBe(true);
  });

  it('restricts seconds input to maximum 59', () => {
    render(<LocalSetupPage />);
    const secondsInput = screen.getByLabelText('Segundos') as HTMLInputElement;

    fireEvent.change(secondsInput, { target: { value: '75' } });

    expect(secondsInput.value).toBe('59');
  });

  it('allows valid seconds values between 0 and 59', () => {
    render(<LocalSetupPage />);
    const secondsInput = screen.getByLabelText('Segundos') as HTMLInputElement;

    fireEvent.change(secondsInput, { target: { value: '45' } });
    expect(secondsInput.value).toBe('45');

    fireEvent.change(secondsInput, { target: { value: '0' } });
    expect(secondsInput.value).toBe('00');

    fireEvent.change(secondsInput, { target: { value: '59' } });
    expect(secondsInput.value).toBe('59');
  });

  it('allows any non-negative minutes value', () => {
    render(<LocalSetupPage />);
    const minutesInput = screen.getByLabelText('Minutos') as HTMLInputElement;

    fireEvent.change(minutesInput, { target: { value: '5' } });
    expect(minutesInput.value).toBe('05');

    fireEvent.change(minutesInput, { target: { value: '0' } });
    expect(minutesInput.value).toBe('00');
  });

  it('navigates to /round when play button is clicked with valid timer', () => {
    render(<LocalSetupPage />);
    const playButton = screen.getByRole('button', { name: /¡JUGAR!/i });

    fireEvent.click(playButton);

    expect(mockNavigate).toHaveBeenCalledWith('/round');
  });

  it('renders the back button', () => {
    render(<LocalSetupPage />);
    expect(screen.getByRole('button', { name: /Volver/i })).toBeInTheDocument();
  });

  it('back button is always enabled', () => {
    render(<LocalSetupPage />);
    const backButton = screen.getByRole('button', { name: /Volver/i }) as HTMLButtonElement;
    expect(backButton.disabled).toBe(false);
  });

  it('navigates to / when back button is clicked', () => {
    render(<LocalSetupPage />);
    const backButton = screen.getByRole('button', { name: /Volver/i });

    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
