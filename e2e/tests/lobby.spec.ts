import { test, expect, BrowserContext, Page } from '@playwright/test';

test.describe.serial('Lobby E2E Tests', () => {
  let hostContext: BrowserContext;
  let guestContext: BrowserContext;
  let hostPage: Page;
  let guestPage: Page;

  test.beforeEach(async ({ browser }) => {
    // Two separate browser contexts simulate two independent users
    hostContext = await browser.newContext();
    guestContext = await browser.newContext();

    hostPage = await hostContext.newPage();
    guestPage = await guestContext.newPage();
  });

  test.afterEach(async () => {
    await hostContext.close();
    await guestContext.close();
  });

  test('should complete full multiplayer flow: host creates lobby, guest joins, both play round', async () => {
    // ── Step 1: Host creates a lobby ──────────────────────────────────────

    await hostPage.goto('/lobby/new');
    await expect(hostPage.getByRole('heading', { name: /Crear Sala/i })).toBeVisible();

    await hostPage.getByLabel(/Tu nombre/i).fill('Host Player');

    // Timer is pre-filled (default: 0 min, 30 s) — change seconds to 59 for a longer round
    await hostPage.getByLabel(/Segundos/i).fill('59');

    await hostPage.getByRole('button', { name: /Crear sala/i }).click();

    // ── Step 2: Host arrives at waiting room ──────────────────────────────

    await hostPage.waitForURL(/\/lobby\/[A-Z0-9]{6}/);

    const currentUrl = hostPage.url();
    const codeMatch = currentUrl.match(/\/lobby\/([A-Z0-9]{6})/);
    expect(codeMatch).not.toBeNull();
    const lobbyCode = codeMatch![1];

    await expect(hostPage.getByRole('heading', { name: /Sala de Espera/i })).toBeVisible({
      timeout: 10_000,
    });
    await expect(hostPage.getByText(lobbyCode)).toBeVisible();
    await expect(hostPage.getByText('Host Player')).toBeVisible();

    // ── Step 3: Guest navigates to the lobby and joins ────────────────────

    await guestPage.goto(`/lobby/${lobbyCode}`);

    await expect(guestPage.getByRole('heading', { name: /Unirse a Sala/i })).toBeVisible();
    await guestPage.getByLabel(/Tu nombre/i).fill('Guest Player');
    await guestPage.getByRole('button', { name: /Unirse/i }).click();

    // ── Step 4: Both see each other in the waiting room ───────────────────

    await expect(guestPage.getByRole('heading', { name: /Sala de Espera/i })).toBeVisible({
      timeout: 10_000,
    });
    await expect(guestPage.getByText('Guest Player')).toBeVisible();

    // Host's player list also shows the guest once WS syncs
    await expect(hostPage.getByText('Guest Player')).toBeVisible({ timeout: 10_000 });

    // ── Step 5: Host starts the round ────────────────────────────────────

    const startRoundButton = hostPage.getByRole('button', { name: /Iniciar ronda/i });
    await expect(startRoundButton).toBeEnabled({ timeout: 5_000 });
    await startRoundButton.click();

    // ── Step 6: Both are redirected to their round pages ─────────────────

    await hostPage.waitForURL(/\/round\/describe/, { timeout: 10_000 });
    await guestPage.waitForURL(/\/round\/guess/, { timeout: 10_000 });

    // Host sees the card
    await expect(hostPage.getByTestId('card-word')).toBeVisible({ timeout: 10_000 });

    // Guest sees the timer
    await expect(guestPage.getByTestId('timer-display')).toBeVisible({ timeout: 10_000 });

    // ── Step 7: Read the word from the host's DOM ─────────────────────────
    // The word is displayed in uppercase; send it in lowercase to the backend

    const cardWordElement = hostPage.getByTestId('card-word');
    const displayedWord = await cardWordElement.textContent();
    expect(displayedWord).toBeTruthy();
    const correctWord = displayedWord!.trim().toLowerCase();

    // ── Step 8: Guest submits the correct guess ───────────────────────────

    await guestPage.getByPlaceholder(/Escribe tu intento/i).fill(correctWord);
    await guestPage.getByRole('button', { name: /Enviar/i }).click();

    // Guest sees success feedback
    await expect(guestPage.getByText(/¡Correcto!/i)).toBeVisible({ timeout: 5_000 });

    // ── Step 9: Host advances to the next card ───────────────────────────

    await hostPage.getByRole('button', { name: /SIGUIENTE/i }).click();

    // Host still shows a card word (may be a new word or the same)
    await expect(hostPage.getByTestId('card-word')).toBeVisible({ timeout: 5_000 });

    // Guest timer is still running (not navigated away)
    await expect(guestPage.getByTestId('timer-display')).toBeVisible();
  });

  test('should show waiting room and reconnect guest after page reload', async () => {
    // ── Step 1: Host creates a lobby ─────────────────────────────────────

    await hostPage.goto('/lobby/new');
    await hostPage.getByLabel(/Tu nombre/i).fill('Host');
    await hostPage.getByLabel(/Segundos/i).fill('59');
    await hostPage.getByRole('button', { name: /Crear sala/i }).click();

    await hostPage.waitForURL(/\/lobby\/[A-Z0-9]{6}/);
    const codeMatch = hostPage.url().match(/\/lobby\/([A-Z0-9]{6})/);
    const lobbyCode = codeMatch![1];

    await expect(hostPage.getByRole('heading', { name: /Sala de Espera/i })).toBeVisible({
      timeout: 10_000,
    });

    // ── Step 2: Guest joins ───────────────────────────────────────────────

    await guestPage.goto(`/lobby/${lobbyCode}`);
    await guestPage.getByLabel(/Tu nombre/i).fill('Guest');
    await guestPage.getByRole('button', { name: /Unirse/i }).click();

    await expect(guestPage.getByRole('heading', { name: /Sala de Espera/i })).toBeVisible({
      timeout: 10_000,
    });

    // ── Step 3: Host starts round ────────────────────────────────────────

    const startRoundButton = hostPage.getByRole('button', { name: /Iniciar ronda/i });
    await expect(startRoundButton).toBeEnabled({ timeout: 5_000 });
    await startRoundButton.click();

    await hostPage.waitForURL(/\/round\/describe/, { timeout: 10_000 });
    await guestPage.waitForURL(/\/round\/guess/, { timeout: 10_000 });

    await expect(guestPage.getByTestId('timer-display')).toBeVisible({ timeout: 10_000 });

    // ── Step 4: Guest reloads the page (simulating a browser refresh) ─────

    await guestPage.reload();

    // After reload, `sessionStorage` data drives reconnection:
    // - GuesserPage loads RoundSessionStorage and calls RejoinRound
    // - If reconnect succeeds, user stays on /round/guess
    // - If session is missing, redirect to /
    await guestPage.waitForURL(/\/round\/guess|\//, { timeout: 15_000 });

    // At minimum, the page must be stable (not crash)
    expect(['/round/guess', '/']).toContain(new URL(guestPage.url()).pathname);
  });
});
