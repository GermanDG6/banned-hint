import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RoundPage } from './RoundPage';
import { CardMother } from '@/features/card/domain/testing/card.mother';

vi.mock('@/shared/session/round-config.session', () => ({
  RoundConfigSession: {
    load: vi.fn(),
    clear: vi.fn(),
  },
}));

vi.mock('@/features/card/ui/hooks/use-get-random-card.hook', () => ({
  useRandomCard: vi.fn(),
}));

vi.mock('@/features/round/ui/hooks/use-countdown.hook', () => ({
  useCountdown: vi.fn(),
}));

import { RoundConfigSession } from '@/shared/session/round-config.session';
import { useRandomCard } from '@/features/card/ui/hooks/use-get-random-card.hook';
import { useCountdown } from '@/features/round/ui/hooks/use-countdown.hook';

function renderRoundPage() {
  return render(
    <MemoryRouter initialEntries={['/round']}>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/local/setup" element={<div>LocalSetup</div>} />
        <Route path="/round" element={<RoundPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RoundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRandomCard).mockReturnValue({
      card: CardMother.withWord('marte'),
      loading: false,
      error: null,
      reload: vi.fn(),
    });
    vi.mocked(useCountdown).mockReturnValue({
      remainingSeconds: 90,
      formatted: '01:30',
      isRunning: true,
      pause: vi.fn(),
      resume: vi.fn(),
      reset: vi.fn(),
    });
  });

  it('should redirect to local setup when no config in sessionStorage', () => {
    vi.mocked(RoundConfigSession.load).mockReturnValue(null);
    renderRoundPage();
    expect(screen.getByText('LocalSetup')).toBeInTheDocument();
  });

  it('should render timer display with formatted time', () => {
    vi.mocked(RoundConfigSession.load).mockReturnValue({ minutes: 1, seconds: 30 });
    renderRoundPage();
    expect(screen.getByText('01:30')).toBeInTheDocument();
  });

  it('should render the card word', () => {
    vi.mocked(RoundConfigSession.load).mockReturnValue({ minutes: 1, seconds: 30 });
    renderRoundPage();
    expect(screen.getByText('MARTE')).toBeInTheDocument();
  });

  it('should call reload when SIGUIENTE is clicked', async () => {
    const user = userEvent.setup();
    const reload = vi.fn();
    vi.mocked(RoundConfigSession.load).mockReturnValue({ minutes: 1, seconds: 30 });
    vi.mocked(useRandomCard).mockReturnValue({
      card: CardMother.valid(),
      loading: false,
      error: null,
      reload,
    });

    renderRoundPage();
    await user.click(screen.getByText('SIGUIENTE'));

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('should call pause when PAUSA is clicked and timer is running', async () => {
    const user = userEvent.setup();
    const pause = vi.fn();
    vi.mocked(RoundConfigSession.load).mockReturnValue({ minutes: 1, seconds: 30 });
    vi.mocked(useCountdown).mockReturnValue({
      remainingSeconds: 90,
      formatted: '01:30',
      isRunning: true,
      pause,
      resume: vi.fn(),
      reset: vi.fn(),
    });

    renderRoundPage();
    await user.click(screen.getByText('PAUSA'));
    expect(pause).toHaveBeenCalledTimes(1);
  });

  it('should call resume and show CONTINUAR when timer is paused', async () => {
    const user = userEvent.setup();
    const resume = vi.fn();
    vi.mocked(RoundConfigSession.load).mockReturnValue({ minutes: 1, seconds: 30 });
    vi.mocked(useCountdown).mockReturnValue({
      remainingSeconds: 45,
      formatted: '00:45',
      isRunning: false,
      pause: vi.fn(),
      resume,
      reset: vi.fn(),
    });

    renderRoundPage();
    expect(screen.getByText('CONTINUAR')).toBeInTheDocument();
    await user.click(screen.getByText('CONTINUAR'));
    expect(resume).toHaveBeenCalledTimes(1);
  });

  it('should clear session and navigate to local setup when exit button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(RoundConfigSession.load).mockReturnValue({ minutes: 1, seconds: 30 });

    renderRoundPage();
    await user.click(screen.getByLabelText('Finalizar partida'));

    expect(vi.mocked(RoundConfigSession.clear)).toHaveBeenCalledTimes(1);
    expect(screen.getByText('LocalSetup')).toBeInTheDocument();
  });
});
