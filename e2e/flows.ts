import { expect, test } from '@playwright/test';

test('all pages fit the viewport and resolve internal links and images', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of ['', 'gracze/', 'zasady/', 'kampanie/']) {
    await page.goto(route);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const resources = await page.locator('main a[href^="/"], img').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute(element.tagName === 'IMG' ? 'src' : 'href')!))]);
    for (const url of resources) expect((await request.get(url)).status(), url).toBe(200);
  }
  expect(errors).toEqual([]);
});

test('hero choice, role change and clearing survive reload', async ({ page }) => {
  await page.goto('gracze/');
  const card = page.locator('[data-hero="arwen"]');
  await card.getByRole('button').click();
  await expect(card).toHaveClass(/is-selected/);
  await card.locator('select').selectOption('Kapitan · Captain');
  await page.reload();
  await expect(card).toHaveClass(/is-selected/);
  await expect(card.locator('select')).toHaveValue('Kapitan · Captain');
  await expect(page.locator('[data-party-slot="jedrzej"] [data-party-name]')).toHaveText('Arwena');
  await page.getByRole('button', { name: 'Usuń wybór: Jędrzej' }).click();
  await page.reload();
  await expect(card).not.toHaveClass(/is-selected/);
});

test('player links, filters and search work together', async ({ page }) => {
  await page.goto('gracze/#milosz');
  await expect(page.locator('[data-player-section]:visible')).toHaveCount(1);
  await expect(page.locator('[data-player-section="milosz"]')).toBeVisible();
  await page.locator('[data-player-filter="all"]').click();
  await page.getByRole('searchbox').fill('renerien');
  await expect(page.locator('[data-hero]:visible')).toHaveCount(1);
  await expect(page.locator('[data-hero="renerien"]')).toBeVisible();
  await page.getByRole('searchbox').fill('nieistniejący bohater');
  await expect(page.locator('#empty-state')).toBeVisible();
});

test('the complete roster and campaign descriptions work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}gracze/`);
  await expect(page.locator('[data-hero]')).toHaveCount(17);
  await expect(page.locator('noscript p')).toBeVisible();
  await expect(page.locator('[data-hero="arwen"] h3')).toHaveText('Arwena');
  await page.goto(`${baseURL}kampanie/`);
  await expect(page.locator('.campaign-card')).toHaveCount(5);
  await expect(page.locator('.campaign-arnor')).toContainText('Najmniej preferowana');
  await context.close();
});
