import { expect, test } from '@playwright/test';

test.describe('home page', () => {
	test('loads without errors or failed requests', async ({ page }) => {
		const problems: string[] = [];
		page.on('pageerror', (error) => problems.push(`page error: ${error.message}`));
		page.on('console', (message) => message.type() === 'error' && problems.push(`console: ${message.text()}`));
		page.on('requestfailed', (request) => problems.push(`request failed: ${request.url()}`));
		page.on('response', (response) => response.status() >= 400 && problems.push(`${response.status()}: ${response.url()}`));

		await page.goto('/');
		await page.waitForLoadState('networkidle');

		expect(problems).toEqual([]);
	});

	test('shows the name, title and portrait', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('heading', { level: 1, name: 'Jason Derifaj' })).toBeVisible();
		await expect(page.getByText('Creative Front-End Developer', { exact: true })).toBeVisible();

		const portrait = page.getByRole('img', { name: /Jason Derifaj, smiling/ });
		await expect(portrait).toBeVisible();
		await expect.poll(() => portrait.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
	});

	test('pins the four disciplines to Cary, Charlotte, Asheville and Wilmington, all on screen', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/');
		const list = page.getByRole('list', { name: 'What I do' });
		await expect(list.getByRole('listitem')).toHaveText([
			'Interactive Web Development',
			'Motion & Scroll Animation',
			'Design Systems & UI Engineering',
			'Accessible, Fast Front-End',
		]);
		expect(await list.getByRole('listitem').evaluateAll((items) => items.map((li) => (li as HTMLElement).dataset.city))).toEqual([
			'Cary',
			'Charlotte',
			'Asheville',
			'Wilmington',
		]);

		const width = page.viewportSize()!.width;
		for (const label of await page.locator('.city-label').all()) {
			await expect(label).toBeVisible();
			const box = (await label.boundingBox())!;
			expect(box.x).toBeGreaterThanOrEqual(0);
			expect(box.x + box.width).toBeLessThanOrEqual(width);
		}
	});

	test('brings each city in with its dot, then uncovers its label', async ({ page }) => {
		await page.goto('/');
		const last = page.locator('.city[data-city="Wilmington"] .city-text');
		await expect.poll(() => last.evaluate((el) => getComputedStyle(el).opacity), { timeout: 15_000 }).toBe('1');
		for (const wipe of await page.locator('.city-wipe').all()) {
			await expect.poll(() => wipe.evaluate((el) => getComputedStyle(el).transform)).toBe('matrix(0, 0, 0, 1, 0, 0)');
		}
	});

	test('has working contact links', async ({ page }) => {
		await page.goto('/');
		const contact = page.getByRole('list', { name: 'Contact' });

		await expect(contact.getByRole('link', { name: 'jderifaj@gmail.com' })).toHaveAttribute('href', 'mailto:jderifaj@gmail.com');
		await expect(contact.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/jderifaj');
		await expect(contact.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
			'href',
			'https://www.linkedin.com/in/jason-derifaj-b219a72',
		);
	});

	test('uses the self-hosted font, not Google Fonts', async ({ page }) => {
		const thirdParty: string[] = [];
		page.on('request', (request) => {
			if (!request.url().startsWith('http://localhost')) thirdParty.push(request.url());
		});

		await page.goto('/');
		await page.evaluate(() => document.fonts.ready);

		expect(thirdParty).toEqual([]);
		expect(await page.evaluate(() => document.fonts.check('700 16px "Figtree Variable"'))).toBe(true);
	});
});

test.describe('search engines', () => {
	test('robots.txt points to the sitemap', async ({ request }) => {
		const robots = await request.get('/robots.txt');
		expect(robots.ok()).toBe(true);
		expect(await robots.text()).toContain('Sitemap: https://jasonderifaj.com/sitemap-index.xml');
	});

	test('sitemap lists the home page', async ({ request }) => {
		const index = await request.get('/sitemap-index.xml');
		expect(index.ok()).toBe(true);

		const sitemap = await request.get('/sitemap-0.xml');
		expect(await sitemap.text()).toContain('<loc>https://jasonderifaj.com/</loc>');
	});
});
