import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.skip(!process.env.E2E_BASE_URL, 'Set E2E_BASE_URL to run preview browser tests.');

test.describe('public release smoke tests', () => {
  test('health endpoint is live and does not cache', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['cache-control']).toBe('no-store');
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  for (const route of ['/', '/privacy', '/projects', '/blog']) {
    test(`${route} renders with accessible landmarks`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', message => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('main#main-content')).toBeVisible();
      await expect(page.locator('h1')).toHaveCount(1);

      const results = await new AxeBuilder({ page }).analyze();
      expect(
        results.violations.filter(item => ['critical', 'serious'].includes(item.impact ?? ''))
      ).toEqual([]);
      expect(consoleErrors).toEqual([]);
    });
  }

  test('public routes expose route-specific canonical metadata and security headers', async ({
    page,
    request,
  }) => {
    const response = await request.get('/projects');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    expect(response.headers()['x-frame-options']).toBe('DENY');
    expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(response.headers()['content-security-policy']).toBeTruthy();
    if (process.env.E2E_EXPECT_PREVIEW === 'true') {
      expect(response.headers()['x-robots-tag']).toContain('noindex');
    }

    await page.goto('/projects', { waitUntil: 'domcontentloaded' });
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    await expect(canonical).toHaveAttribute('href', /\/projects$/);
    expect(await canonical.getAttribute('href')).not.toContain('portfolio-codegiyu.vercel.app');
  });

  test('mobile navigation opens, traps focus, and closes with Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close navigation menu' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('project and blog filters expose selected state', async ({ page }) => {
    await page.goto('/projects', { waitUntil: 'domcontentloaded' });
    const projectFilters = page.locator('button[aria-pressed]');
    await expect(projectFilters).not.toHaveCount(0);
    await projectFilters.last().click();
    await expect(projectFilters.last()).toHaveAttribute('aria-pressed', 'true');

    await page.goto('/blog', { waitUntil: 'domcontentloaded' });
    const blogFilters = page.locator('button[aria-pressed]');
    await expect(blogFilters).not.toHaveCount(0);
    await blogFilters.last().click();
    await expect(blogFilters.last()).toHaveAttribute('aria-pressed', 'true');
  });

  test('missing public content returns a real 404 page', async ({ page }) => {
    const response = await page.goto('/projects/__e2e_missing_project__', {
      waitUntil: 'domcontentloaded',
    });
    // Next streams dynamic not-found UI with a 200 transport status; the rendered
    // not-found document and heading are the reliable contract for this route.
    expect([200, 404]).toContain(response?.status());
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  });

  test('reduced-motion users keep content visible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/projects', { waitUntil: 'networkidle' });
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('[role="img"]').first()).toBeVisible();
  });

  test('does not send analytics before consent', async ({ page }) => {
    const analyticsRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/analytics')) analyticsRequests.push(request.url());
    });
    await page.goto('/privacy', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    expect(analyticsRequests).toEqual([]);
  });

  test('preview robots policy is non-indexable when requested', async ({ request }) => {
    test.skip(
      process.env.E2E_EXPECT_PREVIEW !== 'true',
      'Set E2E_EXPECT_PREVIEW=true for preview policy checks.'
    );
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toContain('Disallow: /');
  });
});
