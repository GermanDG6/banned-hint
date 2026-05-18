import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CTAButton } from './CTAButton';

describe('CTAButton', () => {
  it('should render children when provided', () => {
    render(<CTAButton>Click me</CTAButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(<CTAButton icon="▶">Play</CTAButton>);
    expect(screen.getByText('▶')).toBeInTheDocument();
  });

  it('should not render icon when not provided', () => {
    render(<CTAButton>No icon</CTAButton>);
    expect(screen.queryByText('▶')).not.toBeInTheDocument();
  });

  it('should call onClick handler when clicked and not disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<CTAButton onClick={handleClick}>Click</CTAButton>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should not call onClick when button is disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <CTAButton onClick={handleClick} disabled>
        Click
      </CTAButton>
    );

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should have disabled attribute when disabled prop is true', () => {
    render(<CTAButton disabled>Click</CTAButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should render both children and icon together', () => {
    render(
      <CTAButton icon="🎮">
        Start Game
      </CTAButton>
    );
    expect(screen.getByText('Start Game')).toBeInTheDocument();
    expect(screen.getByText('🎮')).toBeInTheDocument();
  });
});


