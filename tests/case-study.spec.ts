import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the AlexRenew row links to its case study page, which links back to Curated work', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /^Work/ }).click();
	const work = page.getByRole('dialog', { name: 'Curated work' });
	await expect(work).toBeVisible();

	// The project link itself still goes to the live site.
	await expect(work.getByRole('link', { name: /^AlexRenew/ })).toHaveAttribute('href', 'https://www.alexrenew.com/');

	await work.getByRole('link', { name: 'Case study: AlexRenew' }).click();
	await expect(page).toHaveURL('/work/alexrenew/');
	await expect(page).toHaveTitle('AlexRenew case study — Jason Derifaj');
	await expect(page.getByRole('heading', { level: 1, name: 'AlexRenew' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'The challenge' })).toBeVisible();
	await expect(page.getByRole('link', { name: /Visit the live site/ })).toHaveAttribute('href', 'https://www.alexrenew.com/');

	await page.getByRole('link', { name: /Back to work/ }).click();
	await expect(page.getByRole('dialog', { name: 'Curated work' })).toBeVisible();
	await expect(page).toHaveURL('/');
});

test('the ComEd feature row links to its case study page', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /^Work/ }).click();
	const name = 'The Efficient Home, Issue 2 Feature, ComEd';
	await page.getByRole('link', { name: `Case study: ${name}` }).click();
	await expect(page).toHaveURL('/work/comed-feature/');
	await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
	await expect(page.getByRole('link', { name: /Visit the live site/ })).toHaveAttribute(
		'href',
		'https://comed.theefficienthome.com/issue2/feature.html',
	);
});

test('the Dallas row says it has no live site and links only to its case study', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /^Work/ }).click();
	const row = page.getByRole('dialog', { name: 'Curated work' }).getByRole('listitem').filter({ hasText: 'Dallas Street to Home Initiative' });
	await expect(row.getByText('No live site')).toBeVisible();
	await expect(row.getByRole('link')).toHaveCount(1);

	await row.getByRole('link', { name: 'Case study: Dallas Street to Home Initiative' }).click();
	await expect(page).toHaveURL('/work/dallas/');
	await expect(page.getByRole('heading', { level: 1, name: 'Dallas Street to Home Initiative' })).toBeVisible();
	await expect(page.getByText(/No live site/)).toBeVisible();
	await expect(page.getByRole('link', { name: /Visit the live site/ })).toHaveCount(0);
});

test('the Jersey Ready row links to its case study page', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /^Work/ }).click();
	await page.getByRole('link', { name: 'Case study: Jersey Ready, PSEG' }).click();
	await expect(page).toHaveURL('/work/jerseyready/');
	await expect(page.getByRole('heading', { level: 1, name: 'Jersey Ready, PSEG' })).toBeVisible();
	await expect(page.getByRole('link', { name: /Visit the live site/ })).toHaveAttribute('href', 'https://njready.com/');
});

test('BGE Winter Tips is first in Curated work, says its link is coming, and opens its case study', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /^Work/ }).click();
	const first = page.getByRole('dialog', { name: 'Curated work' }).locator('.work-item').first();
	await expect(first).toContainText('Winter Tips, BGE');
	await expect(first.getByText('Link coming soon')).toBeVisible();
	await expect(first.getByRole('link')).toHaveCount(1);

	await first.getByRole('link', { name: 'Case study: Winter Tips, BGE' }).click();
	await expect(page).toHaveURL('/work/bge-winter/');
	await expect(page.getByRole('heading', { level: 1, name: 'Winter Tips, BGE' })).toBeVisible();
	await expect(page.getByText('Link coming soon')).toBeVisible();
});

for (const slug of ['alexrenew', 'comed-feature', 'bge-issue5', 'dallas', 'jerseyready', 'bge-winter']) {
	test(`the ${slug} case study page has no accessibility violations`, async ({ page }) => {
		await page.goto(`/work/${slug}/`);
		const { violations } = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
			.analyze();
		expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
	});
}

test('the Dallas case study shows the navigation recording, looping, with a Pause button', async ({ page }) => {
	await page.goto('/work/dallas/');
	const video = page.getByRole('figure').locator('video');
	await expect(video).toHaveAttribute('src', '/case-studies/dallas-nav.mp4');
	expect(await video.evaluate((v: HTMLVideoElement) => v.loop && v.muted)).toBe(true);

	const toggle = page.getByRole('button', { name: 'Pause' });
	await expect(toggle).toBeVisible();
	await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
	await toggle.click();
	await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
	expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});

test('with reduced motion the recording waits on its poster until Play is pressed', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/work/dallas/');
	const video = page.getByRole('figure').locator('video');
	await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
	await page.waitForTimeout(500);
	expect(await video.evaluate((v: HTMLVideoElement) => v.paused && v.currentTime === 0)).toBe(true);
});
