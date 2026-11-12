// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	// Used for canonical and Open Graph URLs, and by the sitemap
	site: 'https://jasonderifaj.com',
	integrations: [sitemap()],
	// One page, ~9 KB of CSS: inlining it saves a render-blocking request
	build: { inlineStylesheets: 'always' },
});
