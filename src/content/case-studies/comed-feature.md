---
summary: A scroll-driven feature page for ComEd's magazine, built in a few days with AI-assisted development.
---

<dl class="case-facts">
	<div><dt>Client</dt><dd>ComEd, The Efficient Home, Issue 2</dd></div>
	<div><dt>Role</dt><dd>Front-end developer and motion design lead</dd></div>
	<div><dt>Year</dt><dd>2026</dd></div>
	<div><dt>Stack</dt><dd>HTML, CSS, Bootstrap, JavaScript, GSAP, DrawSVG, SVG</dd></div>
</dl>

## The challenge

"Every Neighbor Has a Story" is the cover feature of ComEd's Efficient Home magazine. It profiles people around Chicagoland and the steps they've taken to use energy more efficiently. The design called for a page that felt crafted, like flipping through a print magazine, with layered portraits and cut-paper graphics coming to life as you read. The timeline was a few days.

## The first traditional page I built with AI

I'd used AI on bigger builds, but this was the first traditional, hand-built page I made with AI assisting me. I didn't use it to generate a page and walk away. I used it to remove the slow parts, so I could spend my time on the parts of the design that make the page feel special.

That changed what was possible in the time we had. Features that would usually be cut for schedule made it in.

## Motion that tells the story

The motion was my idea as well as my build. I proposed the hero line animations, the side animations and the curtain effect, then oversaw them from concept to launch so they matched the design and supported the story rather than distracting from it.

- **Hero line animations:** lines draw themselves across the hero as the page opens, setting the hand-made tone for the rest of the feature.
- **A staggered SVG curtain:** each profile opens with a cut-paper band of 13 strips that drop into place in random order. The profile text and callout follow once the paper settles.
- **Layered portraits:** each neighbor's circular portrait is an SVG whose layers animate in as the section reaches the screen.
- **Side animations:** discs roll in and edges wipe across, drawn with GSAP and the DrawSVG plugin.

Every animation starts when its section scrolls into view, and the SVGs load only then, so the first view stays light. Visitors who prefer reduced motion get the finished artwork with no movement.

## Checking the work with AI

Speed only counts if quality holds, so I used AI as a second set of eyes:

- **Mobile views:** checked the layout at many screen sizes, not only the usual breakpoints, and fixed what broke between them.
- **Accessibility:** scanned for missing labels, contrast, heading order, focus and motion preferences.
- **File size:** found heavy images and SVGs and trimmed them, so the artwork stays sharp without weighing the page down.

I reviewed every change myself and tested it in the browser before it shipped.

## The result

ComEd got a feature page with print-quality craft and motion that moves the story forward, delivered in a few days. It showed me that AI doesn't make you skip the details. It gives you time to do more of them.

## What I'd take to the next project

- Use AI for the slow, repetitive parts, so you can spend your time on design and motion.
- Ask it to check your work across devices, accessibility and performance, then verify what it finds yourself.
- A short timeline doesn't have to mean a plain page.
- Suggest motion ideas early. When the developer also owns the motion, idea and build stay in step.
