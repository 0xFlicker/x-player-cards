import { expect, test } from '@playwright/test';

test('crawler gets complete initial metadata and routes have separate framing policies', async ({ request }) => {
  const response = await request.get('/', { headers: { 'User-Agent': 'Twitterbot/1.0' } });
  const html = await response.text(), head = html.split('</head>')[0];
  expect(response.status()).toBe(200);
  expect(head.match(/name="twitter:card"/g)).toHaveLength(1);
  expect(head).toContain('content="player"');
  expect(head).toContain('twitter:player');
  expect(head).not.toContain('twitter:player:stream');
  expect(response.headers()['x-frame-options']).toBe('DENY');
  const player = await request.get('/embed/');
  expect(player.headers()['x-frame-options']).toBeUndefined();
  expect(player.headers()['content-security-policy']).toContain('https://*.twitter.com');
  const poster = await request.get('/poster.png');
  expect(poster.headers()['content-type']).toContain('image/png');
  expect((await poster.body()).length).toBeGreaterThan(1000);
});

for (const size of [320, 640]) test(`plays in nested ${size}px frames with storage denied`, async ({ page, context }) => {
  const errors: string[] = [], requests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  await context.addInitScript(() => {
    for (const key of ['localStorage', 'sessionStorage', 'indexedDB']) Object.defineProperty(window, key, { get() { throw new DOMException('Blocked', 'SecurityError'); } });
    Object.defineProperty(document, 'cookie', { get() { throw new DOMException('Blocked', 'SecurityError'); }, set() { throw new DOMException('Blocked', 'SecurityError'); } });
  });
  await page.goto(`http://localhost:4174/?size=${size}`);
  const player = page.frameLocator('iframe').frameLocator('iframe');
  const overlayFits = await player.locator('#overlay').evaluate(el => el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth);
  expect(overlayFits).toBe(true);
  await player.getByRole('button', { name: 'Let’s play' }).click();
  await player.locator('#board').press('ArrowLeft');
  await player.locator('#board').press('ArrowUp');
  await player.locator('#board').press('Space');
  await expect(player.locator('#score')).not.toHaveText('00000');
  await player.getByRole('button', { name: 'Move right' }).click();
  await player.getByRole('button', { name: 'Hard drop' }).click();
  await player.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(player.locator('#overlay-title')).toHaveText('A little pause.');
  // Enter on the focused resume button must activate it rather than game controls.
  await player.locator('#start').press('Enter');
  await expect(player.locator('#overlay')).toBeHidden();
  const dimensions = await player.locator('body').evaluate(el => ({ width: el.scrollWidth, height: el.scrollHeight, viewportWidth: innerWidth, viewportHeight: innerHeight }));
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewportWidth);
  expect(dimensions.height).toBeLessThanOrEqual(dimensions.viewportHeight);
  const popupPromise = page.waitForEvent('popup');
  await player.getByRole('link', { name: 'Open full page' }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  await expect(popup).toHaveURL('http://127.0.0.1:4173/');
  expect(errors).toEqual([]);
  expect(requests.every(url => ['127.0.0.1', 'localhost'].includes(new URL(url).hostname))).toBe(true);
});

test('a finished game can restart', async ({ page }) => {
  await page.goto('/embed/');
  await page.getByRole('button', { name: 'Let’s play' }).click();
  for (let i = 0; i < 40; i++) {
    if (await page.locator('#start').isVisible()) break;
    await page.locator('#board').press('Space');
  }
  await expect(page.getByRole('button', { name: 'Play again' })).toBeVisible();
  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(page.locator('#score')).toHaveText('00000');
  await expect(page.locator('#overlay')).toBeHidden();
});
