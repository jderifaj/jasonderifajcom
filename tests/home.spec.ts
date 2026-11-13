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

	test('shows the name and title, over a flat green ground with no portrait', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByRole('heading', { level: 1, name: 'Jason Derifaj' })).toBeVisible();
		await expect(page.getByText('Senior Creative Front-End Engineer', { exact: true })).toBeVisible();

		await expect(page.locator('.poster img')).toHaveCount(0);
		await expect(page.locator('.poster-ground')).toHaveCSS('background-color', 'rgb(0, 92, 75)');
	});

	test('names the four disciplines for screen readers, whichever map is showing', async ({ page }) => {
		await page.goto('/');
		for (const discipline of [
			'Interactive Web Development',
			'Motion & Scroll Animation',
			'Design Systems & UI Engineering',
			'Accessible, Fast Front-End',
		]) {
			await expect(page.getByRole('listitem').filter({ hasText: discipline })).toHaveCount(1);
		}
	});

	test('route map: Athens, Cary, Richmond, then Washington, all on screen', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/');
		test.skip(!(await page.locator('[data-route]').count()), 'the poster shows the North Carolina map');

		const stops = page.getByRole('list', { name: /Where I've worked/ });
		// Screen readers hear the city and what I do there; the finished map shows what I do.
		await expect(stops.locator('.visually-hidden')).toHaveText([
			'Athens, GA: Interactive Web Development',
			'Cary, NC: Motion & Scroll Animation',
			'Richmond, VA: Accessible, Fast Front-End',
			'Washington, DC: Design Systems & UI Engineering',
		]);
		await expect(stops.locator('.city-text')).toHaveText([
			'Interactive Web Development',
			'Motion & Scroll Animation',
			'Accessible, Fast Front-End',
			'Design Systems & UI Engineering',
		]);
		const width = page.viewportSize()!.width;
		const lefts: number[] = [];
		for (const label of await stops.locator('.city-label').all()) {
			await expect(label).toBeVisible();
			const box = (await label.boundingBox())!;
			expect(box.x).toBeGreaterThanOrEqual(0);
			expect(box.x + box.width).toBeLessThanOrEqual(width);
			lefts.push(box.x);
		}
		// Every label starts on one vertical axis, through Athens' dot.
		const athens = (await stops.locator('.city-dot').first().boundingBox())!;
		for (const left of lefts) expect(Math.abs(left - (athens.x + athens.width / 2))).toBeLessThan(1.5);
		// No label overlaps another.
		const boxes = await stops.locator('.city-label').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()));
		for (let i = 1; i < boxes.length; i++) expect(boxes[i].bottom).toBeLessThanOrEqual(boxes[i - 1].top);
	});

	test('route map: draws in from Athens to Washington, every stop uncovered', async ({ page }) => {
		await page.goto('/');
		test.skip(!(await page.locator('[data-route]').count()), 'the poster shows the North Carolina map');

		// Athens is named first, then changes to what I do there once the line leaves it.
		const athens = page.locator('.stop .city-text').first();
		await expect(athens).toHaveText('Athens, GA', { timeout: 8_000 });
		await expect(athens).toHaveText('Interactive Web Development', { timeout: 8_000 });

		await expect(page.locator('.stop .city-text')).toHaveText(
			['Interactive Web Development', 'Motion & Scroll Animation', 'Accessible, Fast Front-End', 'Design Systems & UI Engineering'],
			{ timeout: 15_000 },
		);
		for (const text of await page.locator('.stop .city-text').all()) {
			await expect.poll(() => text.evaluate((el) => getComputedStyle(el).opacity), { timeout: 5_000 }).toBe('1');
		}
		// Every strand, rule and state outline is drawn all the way.
		for (const line of await page.locator('.route-strand, .route-rule, .route-state').all()) {
			await expect.poll(() => line.evaluate((el) => getComputedStyle(el).strokeDashoffset)).toBe('0px');
		}
		// Every leader is drawn out to the axis.
		for (const leader of await page.locator('.leader').all()) {
			await expect.poll(() => leader.evaluate((el) => getComputedStyle(el).getPropertyValue('--run').trim())).toBe('1');
		}
	});


	test('pins the four disciplines to Cary, Charlotte, Asheville and Wilmington, all on screen', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/');
		test.skip(!(await page.locator('.cities').count()), 'the poster shows the route map');
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
		test.skip(!(await page.locator('.cities').count()), 'the poster shows the route map');
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
		await expect(contact.getByRole('link', { name: 'github.com/jderifaj' })).toHaveAttribute('href', 'https://github.com/jderifaj');
		await expect(contact.getByRole('link', { name: 'linkedin.com/in/jason-derifaj' })).toHaveAttribute(
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
		expect(await page.evaluate(() => document.fonts.check('700 16px "IBM Plex Sans Variable"'))).toBe(true);
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
