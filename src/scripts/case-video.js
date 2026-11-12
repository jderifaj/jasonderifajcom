import { prefersReducedMotion } from './motion.js';

/**
 * Looping screen recordings in a case study (<figure class="case-video">).
 * They play muted on repeat, with a Pause/Play button since they run longer than five seconds.
 * With reduced motion they wait, paused on their poster, until Play is pressed.
 *
 * The markup has native controls and no autoplay, so without JavaScript the video still works
 * and never starts on its own; this swaps the controls for the button and starts playback.
 */
export function initCaseVideos() {
	for (const figure of document.querySelectorAll('.case-video')) {
		const video = figure.querySelector('video');
		const button = figure.querySelector('.case-video-toggle');
		if (!video || !button) continue;

		const sync = () => (button.textContent = video.paused ? 'Play' : 'Pause');
		video.controls = false;
		button.hidden = false;
		sync();
		// Autoplay can be refused (data saver, low power): the button then just reads Play.
		if (!prefersReducedMotion()) video.play().catch(sync);

		button.addEventListener('click', () => (video.paused ? video.play() : video.pause()));
		video.addEventListener('play', sync);
		video.addEventListener('pause', sync);
	}
}
