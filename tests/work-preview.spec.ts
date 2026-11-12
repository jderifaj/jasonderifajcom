import { expect, test, type Page } from '@playwright/test';

// The hover preview only exists where there is a mouse and room for it.
test.skip(({ isMobile }) => isMobile, 'no hover preview on touch screens');

const openWork = async (page: Page) => {
	await page.goto('/');
	await page.getByRole('button', { name: /^Work/ }).click();
	await expect(page.getByRole('dialog', { name: 'Curated work' })).toBeVisible();
	return page.locator('#work .work-link');
};

/** The image layer currently on top of the preview card. */
const frontLayer = (page: Page) =>
	page.evaluate(() => {
		const layers = [...document.querySelectorAll<HTMLImageElement>('.work-preview-frame img')];
		const front = layers.find((img) => getComputedStyle(img).opacity === '1');
		if (!front) return null;
		const style = getComputedStyle(front);
		return { src: front.currentSrc, width: front.naturalWidth, filter: style.filter, transform: style.transform };
	});

test('hovering a project shows its screenshot, sharp, in the lower right', async ({ page }) => {
	const rows = await openWork(page);

	await rows.nth(0).hover();
	const card = page.locator('.work-preview');
	await expect(card).toBeVisible();

	const preview = await rows.nth(0).getAttribute('data-preview');
	await expect.poll(() => frontLayer(page)).toMatchObject({ filter: 'none', transform: 'none' });
	const layer = await frontLayer(page);
	expect(new URL(layer!.src).pathname).toBe(preview);
	expect(layer!.width).toBeGreaterThanOrEqual(1024);

	await page.mouse.move(5, 5);
	await expect(card).toBeHidden();
});

test('moving back up the list leaves no blur behind', async ({ page }) => {
	const rows = await openWork(page);

	for (const index of [3, 4, 5, 6]) {
		await rows.nth(index).hover();
		await page.waitForTimeout(400);
	}
	for (const index of [5, 4, 3, 2, 1]) {
		await rows.nth(index).hover();
		await page.waitForTimeout(150);
	}

	await expect.poll(() => frontLayer(page), { timeout: 5_000 }).toMatchObject({ filter: 'none', transform: 'none' });
});
