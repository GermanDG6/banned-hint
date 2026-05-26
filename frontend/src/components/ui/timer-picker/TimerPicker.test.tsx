import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimerPicker } from './TimerPicker';

describe('TimerPicker (controlled mode)', () => {
  it('should render minutes and seconds inputs', () => {
    render(
      <TimerPicker
        minutes={5}
        seconds={30}
        onMinutesChange={() => {}}
        onSecondsChange={() => {}}
      />
    );

    expect(screen.getByLabelText('Minutos')).toBeInTheDocument();
    expect(screen.getByLabelText('Segundos')).toBeInTheDocument();
  });

  it('should call onMinutesChange when minutes input changes', async () => {
    const user = userEvent.setup();
    const handleMinutesChange = vi.fn();

    render(
      <TimerPicker
        minutes={0}
        seconds={30}
        onMinutesChange={handleMinutesChange}
        onSecondsChange={() => {}}
      />
    );

    const minutesInput = screen.getByLabelText('Minutos') as HTMLInputElement;
    await user.clear(minutesInput);
    await user.type(minutesInput, '10');

    expect(handleMinutesChange).toHaveBeenCalled();
  });

  it('should call onSecondsChange when seconds input changes', async () => {
    const user = userEvent.setup();
    const handleSecondsChange = vi.fn();

    render(
      <TimerPicker
        minutes={5}
        seconds={0}
        onMinutesChange={() => {}}
        onSecondsChange={handleSecondsChange}
      />
    );

    const secondsInput = screen.getByLabelText('Segundos') as HTMLInputElement;
    await user.clear(secondsInput);
    await user.type(secondsInput, '45');

    expect(handleSecondsChange).toHaveBeenCalled();
  });

  it('should disable inputs when disabled prop is true', () => {
    render(
      <TimerPicker
        minutes={5}
        seconds={30}
        onMinutesChange={() => {}}
        onSecondsChange={() => {}}
        disabled={true}
      />
    );

    expect(screen.getByLabelText('Minutos')).toBeDisabled();
    expect(screen.getByLabelText('Segundos')).toBeDisabled();
  });
});

