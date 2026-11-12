---
summary: A modern, interactive front end built as Astro apps and placed inside Drupal 10.
---

<dl class="case-facts">
	<div><dt>Client</dt><dd>AlexRenew, Alexandria, Virginia</dd></div>
	<div><dt>Role</dt><dd>Front-end developer, from the pitch to launch</dd></div>
	<div><dt>Year</dt><dd>2026</dd></div>
	<div><dt>Stack</dt><dd>Astro, Drupal 10, React, GSAP, JavaScript, Docker, Git, Playwright</dd></div>
</dl>

## The challenge

AlexRenew wanted a site that felt modern, with motion, interactivity and a bold visual design. It also had to stay on Drupal, where their editors already work. Interactive design and a traditional Drupal build usually pull against each other. We wanted both.

## Starting at the pitch

I joined in the capture phase, before we had won the work. I met with AlexRenew to understand what they needed. I told them plainly that if they chose our group, we would push the envelope on design and interactivity rather than hand them another template site. That promise set the bar for everything after it.

## My role

This project was outside my usual Creative Studio work. I joined several development teams as the front-end developer, building the interactive pieces of the site. I made 59 commits across 26 tickets from May to October 2026.

## How it works: Astro apps inside Drupal

Rather than force interactive design into Drupal templates, we built the rich components as **Astro apps** and brought their builds into Drupal as **Layout Builder blocks**. Editors place and configure them like any other block. Visitors get fast HTML with JavaScript only where a component needs it.

Components I built this way include:

- **Homepage hero:** an A/B split layout with contained video, plus landing-page and detail-page variants
- **Photo gallery:** a lightbox and a carousel mode, with caption toggles editors control
- **Card group, accordion group, timeline and stats block:** content-driven blocks styled to the design moodboard
- **Site header and mobile navigation**, using GSAP for the menu sequencing and scroll behavior
- **The 2026 Annual Report:** a standalone Astro app built for its own subdomain, with compressed video and cache-friendly delivery

## Quality was my job too

I treated quality control as part of the work, not a phase at the end:

- **Playwright tests** compared my builds against the designer's prototypes. An **axe** accessibility suite ran alongside them, and I fixed everything it flagged.
- **Unit tests** covered my code.
- **Pixel-level design QA:** spacing, color and type matched the prototype's exact values, not estimates.
- **Performance:** I cut the annual report's images from **37 MB to 8.1 MB** and compressed its five videos.

Just as important, I asked questions. When something in a pull request or a plan felt wrong, I said so, and when something worked but could be better, I said that too. Working with traditional back-end teams, I pressed for those standards to hold across the whole build, not only in my own code.

## The result

AlexRenew got a site with modern design and real interactivity, and their content team kept the Drupal workflow they already knew. Bringing Astro into Drupal let us deliver what we promised in the pitch.

## What I'd take to the next project

- Pick the right tool for each layer. Drupal handles the content and Astro handles the experience, so neither has to do the other's job.
- Automated visual and accessibility tests let you move fast without letting the design drift.
- Asking "could this be better?" early is far cheaper than fixing it after launch.
