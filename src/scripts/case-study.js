import gsap from 'gsap';
import { prefersReducedMotion } from './motion.js';

/**
 * "Case study" links on a work row go to /work/<slug>/.
 * Each carries a small blue dot that pulses gently: a slow breath and a faint ring easing out.
 * Still for reduced motion.
 */
export function initCaseStudyPulse() {
	if (prefersReducedMotion()) return;

	for (const link of document.querySelectorAll('.case-toggle')) {
		const ring = link.querySelector('.case-pulse-ring');
		const dot = link.querySelector('.case-pulse-dot');
		if (!ring || !dot) continue;

		gsap
			.timeline({ repeat: -1, repeatDelay: 0.6 })
			.fromTo(ring, { scale: 1, opacity: 0.45 }, { scale: 2.6, opacity: 0, duration: 1.8, ease: 'sine.out' }, 0)
			.fromTo(dot, { scale: 1 }, { scale: 1.15, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0);
	}
}
