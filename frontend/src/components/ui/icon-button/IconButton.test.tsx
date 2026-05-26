import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('should render the button content', () => {
    render(<IconButton aria-label="Close">✕</IconButton>);

    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('should call onClick when button is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <IconButton aria-label="Close" onClick={handleClick}>
        ✕
      </IconButton>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply danger variant class when variant="danger"', () => {
    const { container } = render(
      <IconButton aria-label="Delete" variant="danger">
        🗑️
      </IconButton>
    );

    const button = container.querySelector('button');
    expect(button?.className).toMatch(/danger/);
  });

  it('should have the correct aria-label', () => {
    render(
      <IconButton aria-label="Open menu">⋯</IconButton>
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Open menu');
  });
});


