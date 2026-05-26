import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  it('should render an input element', () => {
    render(<TextInput />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should apply default styles by default', () => {
    render(<TextInput />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('default');
  });

  it('should apply on-dark styles when variant="on-dark"', () => {
    render(<TextInput variant="on-dark" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('onDark');
  });

  it('should apply error styles when hasError is true', () => {
    render(<TextInput hasError />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('error');
  });

  it('should not apply error styles when hasError is false', () => {
    render(<TextInput hasError={false} />);
    const input = screen.getByRole('textbox');
    expect(input.className).not.toContain('error');
  });

  it('should pass through native input attributes', () => {
    render(<TextInput placeholder="Enter text" type="password" name="test" />);
    const input = screen.getByPlaceholderText('Enter text') as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('name', 'test');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<TextInput disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should apply custom className when provided', () => {
    render(<TextInput className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('should handle input changes', async () => {
    const user = userEvent.setup();
    render(<TextInput />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await user.type(input, 'test value');
    expect(input.value).toBe('test value');
  });
});


