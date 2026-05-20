import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimerDisplay } from './TimerDisplay';

describe('TimerDisplay', () => {
  it('should render the formatted time', () => {
    render(<TimerDisplay formatted="01:30" />);
    expect(screen.getByText('01:30')).toBeInTheDocument();
  });

  it('should render the timer icon', () => {
    render(<TimerDisplay formatted="00:45" />);
    expect(screen.getByText('⏱')).toBeInTheDocument();
  });

  it('should update when formatted prop changes', () => {
    const { rerender } = render(<TimerDisplay formatted="01:30" />);
    rerender(<TimerDisplay formatted="01:29" />);
    expect(screen.getByText('01:29')).toBeInTheDocument();
  });
});

