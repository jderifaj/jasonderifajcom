---
summary: A multi-award-winning, video-led site for PSEG, built in one week, that lets real New Jersey people tell the story.
---

<dl class="case-facts">
	<div><dt>Client</dt><dd>PSEG, Jersey Ready</dd></div>
	<div><dt>Role</dt><dd>Interactive developer</dd></div>
	<div><dt>Year</dt><dd>2025</dd></div>
	<div><dt>Stack</dt><dd>HTML, CSS, Bootstrap, JavaScript, YouTube IFrame Player API, GSAP, ScrollTrigger, DrawSVG</dd></div>
</dl>

## The challenge

Jersey Ready shows how PSEG helps New Jersey customers with their bills, keeps the power on through storms, and builds for the future. We had one week to take it from start to launch.

A week rules out a lot. There was no time for a complex build, so every choice had to do a lot with a little: the story had to land fast, the site had to feel polished, and nothing could be added that we couldn't finish properly.

## Real people, at full size

The story is told by real people in large-scale video rather than by stock photos and long copy.

- **Every section opens on moving footage.** The page starts on drone footage, and each chapter opens on a full-width video loop that plays silently in the background.
- **Headlines rise over the footage.** As you scroll into a chapter, its text overlay rises up over the video with GSAP ScrollTrigger, scrubbed to the scroll, so the words arrive as the picture settles.
- **One button opens the whole story.** A play button on each loop opens the full interview video in a popover, so the background footage works as a preview of the story behind it.

## YouTube, made to belong

The full videos live on PSEG's YouTube channel. A standard YouTube embed would have dropped YouTube's own player, branding and suggested videos into the middle of the design, so I hid all of that and built the site's own controls on top.

- **YouTube's player hidden.** Each video loads through the YouTube IFrame Player API with its controls switched off, related videos limited to PSEG's own channel and the branding kept to a minimum.
- **Our own control bar.** A scrubber, play and pause, mute, captions and fullscreen buttons are styled to match the site and drive the player through the API. The scrubber follows the video twice a second and seeks as you drag it.
- **Captions on demand.** The captions button loads YouTube's English captions track, or switches it off again.
- **Built once, used three times.** One set-up function wires the same controls to every player, so the header video and both chapter videos behave the same way. In a one-week build, that saved time twice: once building it and again testing it.
- **A clean hand-off into the video.** When you press play in the header, a short GSAP timeline moves the logos, the headline and the scroll cue out of the way, and the video opens once they've cleared.

## Animation in just the right places

With a week and a video-led design, motion had to earn its place. I used GSAP only where it helped the story:

- **Numbers drawn by hand.** In the "Who we've helped" and "What we've built" stats, hand-drawn lines and circles draw themselves in with the DrawSVG plugin when they reach the screen, then fill in.
- **A header that steps back.** The header bar starts clear over the drone footage and fades to a dark, see-through bar as you scroll, so the navigation stays readable over any video.
- **A gentle scroll cue.** The mouse icon in the hero bounces softly to invite the first scroll.

Everything else stays still, so the people in the videos stay the focus.

## The result

Jersey Ready launched on schedule, one week after we started, and went on to win multiple awards. The site shows that a short timeline doesn't have to mean a plain one, when the time goes into the few things that matter most.

## What I'd take to the next project

- On a tight timeline, pick a few things to do really well and keep everything else simple.
- Real people on video tell a story faster than any amount of copy.
- A third-party player doesn't have to look like one. Its API lets the design stay yours.
- Build anything you'll use more than once as one reusable piece from the start.
