---
summary: A scroll-told winter guide for BGE where snow piles up on the art, ice grows on the headline and frosted glass reveals every tip.
---

<dl class="case-facts">
	<div><dt>Client</dt><dd>BGE and EmPOWER Maryland</dd></div>
	<div><dt>Role</dt><dd>Interactive developer</dd></div>
	<div><dt>Year</dt><dd>2026</dd></div>
	<div><dt>Stack</dt><dd>Astro, Svelte, TypeScript, GSAP, Canvas, HTML video, Playwright, axe-core</dd></div>
</dl>

## The challenge

Winter Tips, Neighbor-to-Neighbor, gives BGE customers practical ways to save energy through the cold months: do-it-yourself fixes around the house, easy wins inside, and tools from BGE. A neighbor walks you through the house, room by room, as you scroll.

The site was built no fewer than three times in two weeks. As the design, the photography and the film changed, the build had to change with them, while still feeling finished at every review.

## Making it feel like winter

The design set the scene. I suggested effects that would make it feel like winter, and built them:

- **Snow that collects.** Snow falls over the hero and settles on the headline, on the neighbor and even on the "Pause animations" button. The code reads the top edge of each piece of art from its pixels, then builds a pile column by column: the snow covers the white outline first, then spreads onto hair, shoulders and letters, with a soft mound on top. If the window is resized, the piles no longer fit, so they're knocked off as clumps that fall away.
- **Ice forming on the titles.** The headline frosts over from its top edges and slowly grows icicles along its lower edges. The ice stops at a set strength, so the headline stays readable.
- **Frosted glass.** As you scroll past the hero, frost creeps in from the edges of the screen like a window icing over, and the intro reveals itself line by line on the glass. Press "See all tips" and the glass frosts over again, this time revealing every tip as a card. Press Back, or Escape, and it melts away. Scroll back up and the frost melts toward the edges.

## A seamless trip into the house

The story moves from outside the house to inside it with a short film. I worked with the designers and videographers so the zoom through the front door would feel like one continuous camera move:

- **Matching the photo to the film.** The film's first frame is the same house photo the visitor has just scrolled across, placed inside the wider film frame at exactly the right size and position. The camera pulls back to that wide shot, the film's first frame dissolves in, and then it plays.
- **A clean landing.** The film ends on the living room, and the first indoor photo dissolves in over its last frame, lined up with it, so the camera seems to keep going.
- **The right size for every screen.** The film comes in three sizes for wide screens and three crops for phones, which only ever see the middle of the frame. Each screen gets the smallest version that's still sharp, so phones don't download pixels they'll never show.
- **Across three cuts.** The film changed through several cuts and new house photos, and each time the framing was measured again so the hand-off stayed seamless.

## How it's built

- **Astro** builds a self-contained static site that can be copied to any web server, with a **Svelte** island for the Tips view.
- **GSAP** drives the motion. **ScrollTrigger** pins each scene and scrubs it against the scroll, **SplitText** reveals the intro line by line, **ScrollToPlugin** handles the glides, and **DrawSVG** draws the line art. Custom eases match the designer's motion curves.
- **Canvas** renders the snow, the piles, the ice and the frost. The frost runs at half resolution, since it's soft enough to scale up cleanly.
- **The page scrolls natively.** Nothing takes over the mouse wheel: pinned scenes use CSS `position: sticky`, and the layout uses the `svh` and `lvh` viewport units so phone browser bars showing and hiding don't break it.
- **Images** are converted to AVIF with WebP fallbacks at build time, each at the sizes it's actually shown. One panorama went from a 10.5 MB JPG to a 3.5 MB AVIF source.

## Accessible by design

- Every tip is also a plain list for screen readers, so the animated speech bubbles are only decoration.
- The hotspots and tabs are toggle buttons that work from the keyboard, and the chosen tip is read aloud.
- A "Pause animations" button stops the snow and the looping animations, and remembers the choice.
- With reduced motion on, the snow, the smoothing and the glides switch off, and the art gets a still dusting of snow instead.

## Checking the work with AI

With the site rebuilt three times in two weeks, I used AI to assist the development and keep quality steady through every round:

- **Playwright tests:** running them in real browsers after each change.
- **Accessibility scans:** checking with axe-core against WCAG 2.1 AA and Section 508 rules, which report no violations.
- **Image economy:** comparing AVIF quality settings side by side to find the smallest files that still looked right. A full desktop scroll transfers about 1.1 MB, down from 2.5 MB of images alone in the prototype.
- **Mobile views:** testing the layout on desktop and phone sizes, with and without reduced motion.

Lighthouse scores it 91 for performance on a slow mobile connection, and 100 for accessibility, best practices and SEO.

## What I'd take to the next project

- When the brief is a feeling, like winter, small physical details such as snow that settles or frost that spreads do more than any amount of decoration.
- Plan for the build to change. Keeping each scene's numbers in one place made each rebuild faster.
- A seamless transition is a team effort. Matching code to film takes the designers, the videographers and the developer working from the same frame.
