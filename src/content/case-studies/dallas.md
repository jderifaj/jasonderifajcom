---
summary: A scroll-told story of Dallas's plan to house its neighbors, with navigation that follows the reader and animation built by hand in GSAP and SVG.
---

<dl class="case-facts">
	<div><dt>Project</dt><dd>Dallas Street to Home Initiative</dd></div>
	<div><dt>Role</dt><dd>Front-end developer: navigation and animation</dd></div>
	<div><dt>Year</dt><dd>2025</dd></div>
	<div><dt>Stack</dt><dd>HTML, CSS, JavaScript, GSAP, ScrollTrigger, MotionPathPlugin, SVG, USWDS</dd></div>
</dl>

## The challenge

The Street to Home Initiative set out to move people living in Dallas encampments straight into housing. The site explained how, in one long page: funding and partnerships, direct-to-housing, choosing locations and coordinated entry, bringing services onsite, and closing and maintaining each site.

That's a lot to read in one sitting. The page had to feel like one continuous story, and readers needed to know at every moment where they were in it and how much was left.

## My part

The visual design was another designer's. I owned the navigation, including working through its issues, and every animation on the page. I built it all by hand, before AI tools were part of my workflow.

## Navigation that follows the reader

<figure class="case-video">
	<video src="/case-studies/dallas-nav.mp4" poster="/case-studies/dallas-nav.jpg" width="1120" height="700" controls muted loop playsinline preload="metadata" aria-label="Screen recording: scrolling the Dallas page and using its side navigation. The yellow dot runs down the right edge of the open card and hands over to the next card as each section begins."></video>
	<figcaption>
		<span>Scrolling and using the side navigation, zoomed in on the dot.</span>
		<button class="case-video-toggle" type="button" hidden>Pause</button>
	</figcaption>
</figure>

The sidebar has a card for each section of the story, and each card has a track with a dot on it.

- **The dot tracks your reading.** As you scroll through a section, its dot travels down the right edge of the card in step with your position, so the navigation doubles as a progress bar.
- **The map changes shape as you go.** The card for the section you're in grows in proportion to that section's length while the others settle back, so longer chapters look longer.
- **It stays in view.** When a new section starts, its card scrolls itself into view in the sidebar.
- **It works without a mouse.** Click a card, or press Enter or Space on it, to jump to that section. On phones the sidebar opens from a menu button and closes after you jump.

## How the dot keeps time

The timing all comes from GSAP's ScrollTrigger, with one trigger per section of the story:

- **A window in the middle of the screen.** Each section's trigger starts when its top reaches the middle of the screen and ends when its bottom passes it (`start: "top center"`, `end: "bottom center"`). That middle line is where the reader's eye is, so it's what the dot keeps time to.
- **Scrubbed to the scroll.** With `scrub: true`, the trigger reports its progress from 0 to 1 on every scroll update. The dot's position is that progress times the height of its track, set as a `translateY` transform so moving it never forces the page to lay out again.
- **Enter and leave callbacks.** On `onEnter` and `onEnterBack`, the card grows to a quarter of its section's height. On `onLeave` and `onLeaveBack`, it settles back to 150 pixels.
- **Resize first, then scroll.** After a 50 millisecond pause, so the card has its new height, it calls `scrollIntoView({ behavior: "smooth", block: "nearest" })`. The sidebar moves only as far as it needs to.
- **A separate active state.** A second set of triggers marks the current card with an `active` class and `aria-pressed`. The first section starts at the top of the page instead of the middle, and a trigger on the page itself keeps Introduction active when you're back at the very top.
- **An entrance.** On load, the cards grow in from half height with a GSAP `fromTo` on `scaleY`.

## Animation built by hand

Each stage of the plan had its own SVG illustration, and I animated them with GSAP:

- **Paths the eye can follow:** small circles travel along curved paths in the illustrations with GSAP's MotionPathPlugin, so the artwork keeps moving as you read.
- **A stage counter:** as each stage reaches the middle of the screen, a large digit rolls up from 0 to that stage's number like an odometer, and it resets when you scroll back above it.
- **Slow, living graphics:** a ring of shapes turns once a minute, and paired shapes drift in and out of place.
- **The final stage:** a gold strip drops in, a ball rides down with it, and a row of dots fades in one at a time.

## The result

The site was finished but never launched. Political changes closed the organization down before it went public, and the site now sits behind a login I can't share, so there's no live link.

The work still stands as the pattern I return to for long-form pages: navigation that tells readers where they are, and motion that keeps a long story moving.

## What I'd take to the next project

- On a long page, the navigation is part of the story. Showing progress keeps readers going.
- Size the map to the content, so readers can see how long each chapter is before they start it.
- Motion should keep a long read moving forward. If it doesn't, cut it.
- I'd add a reduced-motion version from the start, so readers who turn motion off get the finished artwork, still.
