import { defineConfig, devices } from '@playwright/test';

// Tests run against the production build, served by `astro preview`.
// Set TEST_PORT if 4325 is taken on your machine.
const port = Number(process.env.TEST_PORT ?? 4325);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL,
		trace: 'retain-on-failure',
	},
	projects: [
		{ name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
		{ name: 'mobile', use: { ...devices['Pixel 7'] } },
	],
	webServer: {
		command: `npm run build && npx astro preview --port ${port} --ignore-lock`,
		url: baseURL,
		reuseExistingServer: false,
		timeout: 120_000,
	},
});
