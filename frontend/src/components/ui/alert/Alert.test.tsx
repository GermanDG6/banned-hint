import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert', () => {
  it('should render the message passed as children', () => {
    render(<Alert variant="error">Error message</Alert>);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should apply error styles with variant="error"', () => {
    render(<Alert variant="error">Error</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('error');
  });

  it('should apply success styles with variant="success"', () => {
    render(<Alert variant="success">Success</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('success');
  });

  it('should have role="alert" for accessibility', () => {
    render(<Alert variant="error">Alert message</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should apply custom className when provided', () => {
    render(<Alert variant="error" className="custom-class">Message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });
});


