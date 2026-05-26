import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('should show "✓ Conectado" when status="connected"', () => {
    render(<StatusBadge status="connected" />);

    expect(screen.getByText('✓ Conectado')).toBeInTheDocument();
  });

  it('should show "✗ Desconectado" when status="disconnected"', () => {
    render(<StatusBadge status="disconnected" />);

    expect(screen.getByText('✗ Desconectado')).toBeInTheDocument();
  });

  it('should apply connected class when status="connected"', () => {
    const { container } = render(<StatusBadge status="connected" />);

    const badge = container.querySelector('div');
    expect(badge?.className).toMatch(/connected/);
  });

  it('should apply disconnected class when status="disconnected"', () => {
    const { container } = render(<StatusBadge status="disconnected" />);

    const badge = container.querySelector('div');
    expect(badge?.className).toMatch(/disconnected/);
  });
});


