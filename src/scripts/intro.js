import gsap from 'gsap';
import { hasFinePointer, pointerOffset, prefersReducedMotion } from './motion.js';

/**
 * Builds the poster in: band, name, lines, then the tiles.
 * Returns the timeline, or null when motion is reduced.
 */
export function playIntro() {
	if (prefersReducedMotion()) return null;

	const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
		.from('.poster-photo', { scale: 1.12, duration: 2.4, ease: 'power2.out' }, 0)
		.from('.band', { clipPath: 'inset(0 100% 0 0)', duration: 0.9, ease: 'power4.inOut' }, 0.15)
		.from('.band-title > *', { yPercent: 60, opacity: 0, stagger: 0.12, duration: 0.7 }, 0.6)
		.from('.logo span', { opacity: 0, scale: 0.5, stagger: 0.06, duration: 0.4 }, 0.8)
		.from('.disciplines li', { x: -40, opacity: 0, stagger: 0.09, duration: 0.7 }, 0.9)
		.from('.disciplines .dash', { scaleX: 0, stagger: 0.09, duration: 0.5 }, 1.25)
		.from(['.poster-url', '.poster-meta', '.poster-contact'], { opacity: 0, y: 16, stagger: 0.12, duration: 0.6 }, 1.35)
		.from('.tile', { opacity: 0, y: 30, stagger: 0.12, duration: 0.7 }, 1.5);

	if (hasFinePointer()) followPointer();
	return timeline;
}

/** The portrait drifts against the pointer and the state drifts with it. */
function followPointer() {
	const photoX = gsap.quickTo('.poster-photo', 'x', { duration: 1.2, ease: 'power3.out' });
	const photoY = gsap.quickTo('.poster-photo', 'y', { duration: 1.2, ease: 'power3.out' });
	const stateX = gsap.quickTo('.state', 'x', { duration: 1.6, ease: 'power3.out' });

	window.addEventListener('pointermove', (event) => {
		const { x, y } = pointerOffset(event);
		photoX(x * -24);
		photoY(y * -16);
		stateX(x * 18);
	});
}
