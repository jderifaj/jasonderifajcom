import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Color and contrast are reviewed by eye, not here.
const audit = (page: Page) =>
	new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
		.disableRules(['color-contrast'])
		.analyze();

const summarize = (violations: Awaited<ReturnType<typeof audit>>['violations']) =>
	violations.map(({ id, help, nodes }) => `${id}: ${help} (${nodes.map((node) => node.target.join(' ')).join(', ')})`);

// Audit the settled page, not frames of the intro animation.
test.use({ reducedMotion: 'reduce' });

test('home page has no accessibility violations', async ({ page }) => {
	await page.goto('/');
	expect(summarize((await audit(page)).violations)).toEqual([]);
});

test('curated work panel has no accessibility violations', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /^Work/ }).click();
	await expect(page.getByRole('dialog', { name: 'Curated work' })).toBeVisible();
	expect(summarize((await audit(page)).violations)).toEqual([]);
});

test('recommendations panel has no accessibility violations', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /^Words/ }).click();
	await expect(page.getByRole('dialog', { name: 'Recommendations from colleagues' })).toBeVisible();
	expect(summarize((await audit(page)).violations)).toEqual([]);
});

test('every image has a text alternative or is marked decorative', async ({ page }) => {
	await page.goto('/');
	const images = await page.locator('img').evaluateAll((imgs) =>
		imgs.map((img) => ({ src: img.getAttribute('src'), alt: img.getAttribute('alt') })),
	);
	for (const image of images) expect(image.alt, `alt for ${image.src}`).not.toBeNull();
});
