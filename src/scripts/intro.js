import gsap from 'gsap';
import { hasFinePointer, pointerOffset, prefersReducedMotion } from './motion.js';

/**
 * Builds the poster in, from a white page with the name in black: the emerald plane rises and
 * stops, then navy and deep green rise together to fill the page. The name turns mint wherever
 * a plane has risen behind it: the first letters as the emerald comes up, the rest with the
 * navy. Then the title and intro come up, the contact rows wipe in along their rules, and the
 * navigation appears.
 * Returns the timeline, or null when motion is reduced.
 */
export function playIntro() {
	if (prefersReducedMotion()) return null;

	// The page starts white, with the name in black. Each piece's start state is set as the
	// timeline is built, so the poster can be shown (it is hidden in CSS until now) without a flash.
	const fillName = trackPlanes();
	const timeline = gsap.timeline({ defaults: { ease: 'power3.out' }, onUpdate: fillName })
		// The emerald plane rises from the foot first, and stops
		.from('.poster-plane', { scaleY: 0, transformOrigin: '50% 100%', duration: 0.8, ease: 'power4.out' }, 0.2)
		// Then navy and the deep green rise from the bottom to fill the page: navy starts first,
		// green a beat later, and both finish together
		.from('.poster-block', { scaleY: 0, transformOrigin: '50% 100%', duration: 1.1, ease: 'power3.inOut' }, 1.3)
		.from('.poster-ground', { scaleY: 0, transformOrigin: '50% 100%', duration: 0.8, ease: 'power3.inOut' }, 1.6)
		// Planes in: the name is mint all over, and the black copy goes
		.add(() => {
			gsap.set('.name-fill', { clearProps: 'clipPath' });
			gsap.set('.name-ink', { display: 'none' });
		}, 2.4)
		.from(['.band .role', '.disciplines', '.poster-meta'], { opacity: 0, y: 18, stagger: 0.1, duration: 0.7 }, 2.4)
		// Each contact row wipes in along its rule
		.from('.poster-contact li', {
			clipPath: 'inset(0 100% 0 0)',
			duration: 0.8,
			ease: 'power3.inOut',
			stagger: 0.09,
			clearProps: 'clipPath',
		}, 2.6)
		.from(['.credit', '.tile', '.copyright'], { opacity: 0, duration: 0.8, stagger: 0.08 }, 2.8);

	fillName();
	gsap.set('.poster > *', { visibility: 'visible' });

	// The route map moves its own layers (src/scripts/route.js); North Carolina drifts whole.
	if (hasFinePointer() && document.querySelector('.state:not(.state--route)')) followPointer();
	return timeline;
}

/**
 * Returns a function that clips the mint name to the area the emerald and navy planes cover
 * right now, so the black name underneath turns mint as they rise. The emerald plane covers the
 * name left of the navy plane's edge; the navy covers the rest.
 */
function trackPlanes() {
	const fill = document.querySelector('.name-fill');
	const emerald = document.querySelector('.poster-plane');
	const navy = document.querySelector('.poster-block');
	if (!fill || !emerald || !navy) return () => {};

	return () => {
		const box = fill.getBoundingClientRect();
		const left = emerald.getBoundingClientRect();
		const right = navy.getBoundingClientRect();
		const edge = right.left - box.left;
		const leftTop = left.top - box.top;
		const rightTop = right.top - box.top;
		fill.style.clipPath = `polygon(0 ${leftTop}px, ${edge}px ${leftTop}px, ${edge}px ${rightTop}px, 100% ${rightTop}px, 100% 100%, 0 100%)`;
	};
}

/** North Carolina drifts with the pointer. */
function followPointer() {
	const stateX = gsap.quickTo('.state', 'x', { duration: 1.6, ease: 'power3.out' });

	window.addEventListener('pointermove', (event) => {
		const { x } = pointerOffset(event);
		stateX(x * 18);
	});
}
