import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the AlexRenew case study drops down under its row and closes again', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /^Work/ }).click();
	const work = page.getByRole('dialog', { name: 'Curated work' });
	await expect(work).toBeVisible();

	const toggle = work.getByRole('button', { name: 'Case study: AlexRenew' });
	const caseStudy = work.getByRole('region', { name: 'AlexRenew case study' });
	await expect(toggle).toHaveAttribute('aria-expanded', 'false');
	await expect(caseStudy).toBeHidden();

	await toggle.click();
	await expect(toggle).toHaveAttribute('aria-expanded', 'true');
	await expect(caseStudy).toBeVisible();
	await expect(caseStudy.getByRole('heading', { name: 'The challenge' })).toBeInViewport();

	// The project link itself still goes to the live site.
	await expect(work.getByRole('link', { name: /^AlexRenew/ })).toHaveAttribute('href', 'https://www.alexrenew.com/');

	await toggle.click();
	await expect(toggle).toHaveAttribute('aria-expanded', 'false');
	await expect(caseStudy).toBeHidden();
});

test('the open case study has no accessibility violations', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');
	await page.getByRole('button', { name: /^Work/ }).click();
	await page.getByRole('button', { name: 'Case study: AlexRenew' }).click();
	await expect(page.getByRole('region', { name: 'AlexRenew case study' })).toBeVisible();

	const { violations } = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
		.disableRules(['color-contrast'])
		.include('#alexrenew-case')
		.analyze();
	expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});
