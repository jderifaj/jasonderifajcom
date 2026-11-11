# jasonderifaj.com

Source for my portfolio site, live at **https://jasonderifaj.com/**.

## Why it exists

Most of my work is client sites built at ICF's Creative Studio for PSEG, BGE, HUD, the National Cancer Institute and others, and that code isn't public. This site is the one place that shows the work itself: each project links to its live site, alongside what colleagues say about working with me.

## How it works

- **Astro 5** renders the site to static HTML. Each section is its own component in `src/components/` (`header`, `work`, `comments`, `footer` and others), assembled in `src/layouts/Layout.astro`.
- **Bootstrap 5** handles the grid and responsive layout.
- **GSAP ScrollTrigger** (`src/assets/js/home.js`) pins the Curated work section while you scroll and draws a line under each project in turn, scrubbed to the scroll position.
- **Astro's `<Image>`** turns the project thumbnails in `src/assets/images/` into optimized, sized images at build time.

## Decisions

- **Astro** because the site is mostly static content; it ships plain HTML and adds JavaScript only where a section needs it.
- **Content in the HTML**, so it reads without JavaScript and is easy for search engines and screen readers.
- **Animation as an enhancement:** the content is in the HTML first, and GSAP adds the scroll-linked line drawing on top of it.

## Run it

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # production build in ./dist
npm run preview  # serve the build locally
```

## Deploy

Hosted on Netlify.

## License

MIT, see [LICENSE](LICENSE).
