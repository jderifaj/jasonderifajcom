# jasonderifaj.com

Source for my portfolio site, live at **https://jasonderifaj.com/**.

## Why it exists

Most of my work is client sites built at ICF's Creative Studio for PSEG, BGE, ComEd, HUD, the National Cancer Institute and others, and that code isn't public. This site is the one place that shows the work itself: each project links to its live site, alongside what colleagues say about working with me.

## The design

The home page is a single typographic poster: a duotone close-up portrait fills the screen, a white band carries my name and title, and large lines of type end in short accent dashes. Behind the type, an outline of North Carolina is overprinted on the portrait in the manner of Max Huber's 1950s covers: an outline and a truss lattice.

The work and the testimonials are tucked behind two tiles, **Work** and **Words**, which open full-screen panels.

## How it works

- **Astro 7** renders the site to static HTML.
- **Plain CSS** in `src/styles/global.css`, in numbered sections, with the palette and type sizes as custom properties on `:root`. Type is Figtree, self-hosted from `@fontsource-variable/figtree`, with the Latin subset preloaded.
- **Native `<dialog>`** elements for the panels, opened with `commandfor`/`command` buttons, with a small script fallback for browsers that don't support those yet.
- **GSAP** runs the poster's intro and pointer parallax, then brings North Carolina in last: the outline fades up and the lattice draws itself line by line, growing from a few random points until the clusters meet, draws the lines in when a panel opens, and drives the hover preview: hovering or focusing a project shows a large screenshot in the lower right, and new screenshots wipe in over the old one.
- **Astro's image pipeline** serves the portrait as AVIF with a WebP fallback, and turns the project screenshots into small thumbnails and 1024 px hover previews at build time.

```
src/
├── data/
│   ├── projects.ts          Curated work, newest first
│   ├── north-carolina.ts    The state outline (U.S. Census, public domain)
│   └── recommendations.ts   Quotes from colleagues
├── components/
│   ├── Poster.astro         The home page poster
│   ├── Panel.astro          Full-screen dialog shell
│   ├── WorkList.astro       Curated work rows and the hover preview card
│   └── Recommendations.astro
├── scripts/
│   ├── home.js              Entry point
│   ├── intro.js             Poster intro and pointer parallax
│   ├── state.js             North Carolina's outline and growing lattice
│   ├── panels.js            Opening, closing and animating the panels
│   ├── work-preview.js      The hover preview card
│   └── motion.js            Reduced-motion and pointer helpers
├── lib/lattice.ts           Builds the state's truss lattice as line segments
├── layouts/Layout.astro     Page shell, metadata and font preload
├── pages/index.astro        Puts the poster and panels together
└── styles/global.css
tests/                       Playwright end-to-end and accessibility tests
```

## Adding a project

1. Take a screenshot of the live site at 2x, cropped to 75:40 (for example 2048 × 1092), and save it as `src/assets/images/work/<slug>.webp`.
2. Add an entry to `src/data/projects.ts` with its `slug`, `title`, `year`, `url`, and `alt` text describing what the screenshot shows.

The build stops with a clear error if a project's screenshot is missing.

## Decisions

- **Astro** because the site is mostly static content; it ships plain HTML and adds JavaScript only where a section needs it.
- **Content in the HTML**, so it reads without JavaScript and is easy for search engines and screen readers. Without JavaScript, the panels still open in browsers that support invoker commands.
- **Animation as an enhancement:** everything is in the HTML first, and GSAP adds motion on top. Visitors with reduced motion turned on get plain fades instead.
- **Sharp previews:** the hover card loses its transforms once it settles, because a transformed layer is resampled by the browser and looks soft.
- **Accessible by default:** links that open a new tab say so to screen readers, the earlier magazine issues name the magazine, recommendations are marked up as quotes, and every target is at least 24 px. Axe checks run on every page state in the tests.

## Run it

Requires Node 22.23.4 or later (`.nvmrc` pins Node 24).

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # production build in ./dist
npm run preview  # serve the build locally
```

## Test

[Playwright](https://playwright.dev/) runs the suite against the production build, at desktop and phone sizes. It covers the page loading cleanly, the panels with mouse and keyboard, the hover preview staying sharp, contact links, the sitemap, and [axe](https://github.com/dequelabs/axe-core) accessibility checks (color contrast is reviewed separately).

```sh
npx playwright install chromium   # once
npm test                          # builds, serves on port 4325, runs the tests
```

Set `TEST_PORT` to use a different port.

## Deploy

Hosted on Netlify, which uses the Node version in `.nvmrc`.

## License

MIT, see [LICENSE](LICENSE).
