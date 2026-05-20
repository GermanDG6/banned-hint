import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuessForm } from './GuessForm';

describe('GuessForm', () => {
  it('should render input and submit button', () => {
    const mockOnSubmit = vi.fn();
    render(<GuessForm onSubmit={mockOnSubmit} guessResult={null} />);

    expect(screen.getByPlaceholderText(/escribe tu intento/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });

  it('should call onSubmit with trimmed word when form is submitted', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();

    render(<GuessForm onSubmit={mockOnSubmit} guessResult={null} />);

    const input = screen.getByPlaceholderText(/escribe tu intento/i);
    const button = screen.getByRole('button', { name: /enviar/i });

    await user.type(input, '  manzana  ');
    await user.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith('manzana');
  });

  it('should show validation error when word is empty', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();

    render(<GuessForm onSubmit={mockOnSubmit} guessResult={null} />);

    const button = screen.getByRole('button', { name: /enviar/i });
    await user.click(button);

    expect(screen.getByText(/debes escribir una palabra/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show correct feedback when guessResult is correct', () => {
    const mockOnSubmit = vi.fn();
    render(<GuessForm onSubmit={mockOnSubmit} guessResult={{ correct: true }} />);

    expect(screen.getByText(/✅ ¡correcto!/i)).toBeInTheDocument();
  });

  it('should show incorrect feedback when guessResult is incorrect', () => {
    const mockOnSubmit = vi.fn();
    render(<GuessForm onSubmit={mockOnSubmit} guessResult={{ correct: false }} />);

    expect(screen.getByText(/❌ inténtalo de nuevo/i)).toBeInTheDocument();
  });

  it('should disable input and button when guessResult is not null', () => {
    const mockOnSubmit = vi.fn();
    render(<GuessForm onSubmit={mockOnSubmit} guessResult={{ correct: true }} />);

    const input = screen.getByPlaceholderText(/escribe tu intento/i);
    const button = screen.getByRole('button', { name: /enviar/i });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('should reset input after successful submission', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();

    render(<GuessForm onSubmit={mockOnSubmit} guessResult={null} />);

    const input = screen.getByPlaceholderText(/escribe tu intento/i) as HTMLInputElement;
    const button = screen.getByRole('button', { name: /enviar/i });

    await user.type(input, 'palabra');
    await user.click(button);

    expect(input.value).toBe('');
  });
});
