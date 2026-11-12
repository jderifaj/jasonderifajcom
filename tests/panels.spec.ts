import { expect, test } from '@playwright/test';
import { projects } from '../src/data/projects';
import { recommendations } from '../src/data/recommendations';

test.describe('panels', () => {
	test('Work opens the curated work and closes again', async ({ page }) => {
		await page.goto('/');
		const opener = page.getByRole('button', { name: /^Work/ });

		await opener.click();
		const dialog = page.getByRole('dialog', { name: 'Curated work' });
		await expect(dialog).toBeVisible();
		await expect(dialog.locator('.work-item')).toHaveCount(projects.length);

		await dialog.getByRole('button', { name: 'Close' }).click();
		await expect(dialog).toBeHidden();
		await expect(opener).toBeFocused();
	});

	test('Words opens the recommendations', async ({ page }) => {
		await page.goto('/');

		await page.getByRole('button', { name: /^Words/ }).click();
		const dialog = page.getByRole('dialog', { name: 'Recommendations from colleagues' });
		await expect(dialog).toBeVisible();
		await expect(dialog.locator('blockquote')).toHaveCount(recommendations.length);
	});

	test('works from the keyboard, and Escape closes', async ({ page }) => {
		await page.goto('/');
		const opener = page.getByRole('button', { name: /^Work/ });

		await opener.focus();
		await page.keyboard.press('Enter');
		const dialog = page.getByRole('dialog', { name: 'Curated work' });
		await expect(dialog).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(dialog).toBeHidden();
		await expect(opener).toBeFocused();
	});

	test('every project links out in a new tab and says so', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: /^Work/ }).click();
		// Case study links stay on this site, at /work/<slug>/ (see case-study.spec.ts).
		const links = page
			.getByRole('dialog', { name: 'Curated work' })
			.getByRole('link')
			.and(page.locator(':not(.case-toggle)'));

		for (const link of await links.all()) {
			await expect(link).toHaveAttribute('target', '_blank');
			await expect(link).toHaveAttribute('rel', /noopener/);
			await expect(link).toHaveAccessibleName(/opens in a new tab/);
		}
	});

	test('earlier issues say which magazine they belong to', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: /^Work/ }).click();

		const earlier = page.getByRole('list', { name: 'Earlier issues' }).getByRole('link');
		await expect(earlier).toHaveCount(4);
		await expect(earlier.first()).toHaveAccessibleName(/^The Efficient Home, BGE, Issue 4 2025/);
	});
});
