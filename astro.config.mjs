// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Used to build absolute URLs for canonical and Open Graph tags
  site: 'https://jasonderifaj.com',

  integrations: [sitemap()],
});