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

test('the case study page has no accessibility violations', async ({ page }) => {
	await page.goto('/work/alexrenew/');
	const { violations } = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
		.analyze();
	expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});
