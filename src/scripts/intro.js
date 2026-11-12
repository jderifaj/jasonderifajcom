import gsap from 'gsap';
import { hasFinePointer, pointerOffset, prefersReducedMotion } from './motion.js';

/** Builds the poster in: band, name, monogram, lines, then the tiles. */
export function playIntro() {
	if (prefersReducedMotion()) return;

	gsap.timeline({ defaults: { ease: 'power3.out' } })
		.from('.poster-photo', { scale: 1.12, duration: 2.4, ease: 'power2.out' }, 0)
		.from('.band', { clipPath: 'inset(0 100% 0 0)', duration: 0.9, ease: 'power4.inOut' }, 0.15)
		.from('.band-title > *', { yPercent: 60, opacity: 0, stagger: 0.12, duration: 0.7 }, 0.6)
		.from('.monogram-tile', { opacity: 0, y: 60, stagger: 0.15, duration: 1.1 }, 0.7)
		.from('.logo span', { opacity: 0, scale: 0.5, stagger: 0.06, duration: 0.4 }, 0.8)
		.from('.disciplines li', { x: -40, opacity: 0, stagger: 0.09, duration: 0.7 }, 0.9)
		.from('.disciplines .dash', { scaleX: 0, stagger: 0.09, duration: 0.5 }, 1.25)
		.from(['.poster-url', '.poster-meta', '.poster-contact'], { opacity: 0, y: 16, stagger: 0.12, duration: 0.6 }, 1.35)
		.from('.tile', { opacity: 0, y: 30, stagger: 0.12, duration: 0.7 }, 1.5);

	if (hasFinePointer()) followPointer();
}

/** The portrait drifts against the pointer and the monogram drifts with it. */
function followPointer() {
	const photoX = gsap.quickTo('.poster-photo', 'x', { duration: 1.2, ease: 'power3.out' });
	const photoY = gsap.quickTo('.poster-photo', 'y', { duration: 1.2, ease: 'power3.out' });
	const monogramX = gsap.quickTo('.monogram', 'x', { duration: 1.6, ease: 'power3.out' });

	window.addEventListener('pointermove', (event) => {
		const { x, y } = pointerOffset(event);
		photoX(x * -24);
		photoY(y * -16);
		monogramX(x * 18);
	});
}
