# jasonderifaj.com

Source for my portfolio site, live at **https://jasonderifaj.com/**.

## Why it exists

Most of my work is client sites built at ICF's Creative Studio for PSEG, BGE, ComEd, HUD, the National Cancer Institute and others, and that code isn't public. This site is the one place that shows the work itself: each project links to its live site, alongside what colleagues say about working with me.

## The design

The home page is a single typographic poster: a duotone close-up portrait fills the screen, a white band carries my name and title, and large lines of type end in short accent dashes. Translucent monogram tiles sit behind the type, and a small boxed `J D </>` mark echoes the poster's logo.

The work and the testimonials are tucked behind two tiles, **Work** and **Words**, which open full-screen panels.

## How it works

- **Astro 7** renders the site to static HTML.
  - `src/components/poster.astro` is the home page poster.
  - `src/components/work.astro` is the Curated work list. Projects are a data array at the top of the file, newest first. Earlier issues of BGE's magazine are listed in a strip under Issue 5 instead of as rows of their own.
  - `src/components/comments.astro` holds the testimonials.
  - `src/pages/index.astro` puts the poster and the two panels together; `src/layouts/Layout.astro` is the page shell.
- **Plain CSS** in `src/styles/global.css`, with the palette as custom properties on `:root` (`--accent`, `--accent-hot`, `--accent-soft`, `--ink`, `--paper`). Type is Figtree from Google Fonts.
- **Native `<dialog>`** elements for the panels, opened with `commandfor`/`command` buttons, with a small script fallback for browsers that don't support those yet.
- **GSAP** (`src/assets/js/home.js`) runs the poster's intro animation and pointer parallax, draws the lines in when the Work panel opens, and drives the hover preview: hovering or focusing a project shows a large screenshot in the lower right, and new screenshots wipe in over the old one.
- **Astro's image pipeline** turns the screenshots into small thumbnails and 1024 px hover previews (WebP) at build time.

## Adding a project

1. Take a screenshot of the live site at 2x, cropped to 75:40 (for example 2048 × 1092), and save it as `src/assets/images/work/<slug>.webp`.
2. Add a line to the `projects` array in `src/components/work.astro`, for example `{ slug, title, year, url }`.

A project without a screenshot still gets a row, with a plain tile and no hover preview.

## Decisions

- **Astro** because the site is mostly static content; it ships plain HTML and adds JavaScript only where a section needs it.
- **Content in the HTML**, so it reads without JavaScript and is easy for search engines and screen readers. Without JavaScript, the panels still open in browsers that support invoker commands.
- **Animation as an enhancement:** everything is in the HTML first, and GSAP adds motion on top. Visitors with reduced motion turned on get plain fades instead.
- **Sharp previews:** the hover card loses its transforms once it settles, because a transformed layer is resampled by the browser and looks soft.

## Run it

Requires Node 22.23.4 or later (`.nvmrc` pins Node 24).

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # production build in ./dist
npm run preview  # serve the build locally
```

## Deploy

Hosted on Netlify, which uses the Node version in `.nvmrc`.

## License

MIT, see [LICENSE](LICENSE).
