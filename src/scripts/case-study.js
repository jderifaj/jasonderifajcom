import gsap from 'gsap';
import { prefersReducedMotion } from './motion.js';

/**
 * "Case study" buttons on a work row drop the case study down under that row.
 *
 * Without JavaScript the case study is simply shown open and the button is hidden
 * (see .case-toggle in global.css), so the text is always reachable.
 */
export function initCaseStudies() {
	for (const button of document.querySelectorAll('[data-case-toggle]')) {
		const panel = document.getElementById(button.getAttribute('aria-controls'));
		if (!panel) continue;
		panel.hidden = true;

		button.addEventListener('click', () => {
			const opening = button.getAttribute('aria-expanded') !== 'true';
			button.setAttribute('aria-expanded', String(opening));
			if (opening) open(panel);
			else close(panel);
		});
	}
}

function open(panel) {
	gsap.killTweensOf(panel);
	panel.hidden = false;
	if (prefersReducedMotion()) return;

	gsap.fromTo(
		panel,
		{ height: 0 },
		{ height: 'auto', duration: 0.7, ease: 'power3.inOut', onComplete: () => gsap.set(panel, { clearProps: 'height' }) },
	);
	gsap.from(panel.querySelectorAll('.case-study-body > *'), {
		y: 16,
		opacity: 0,
		duration: 0.5,
		stagger: 0.03,
		ease: 'power2.out',
		delay: 0.2,
		clearProps: 'transform,opacity',
	});
}

function close(panel) {
	gsap.killTweensOf(panel);
	if (prefersReducedMotion()) {
		panel.hidden = true;
		return;
	}

	gsap.to(panel, {
		height: 0,
		duration: 0.5,
		ease: 'power3.inOut',
		onComplete: () => {
			panel.hidden = true;
			gsap.set(panel, { clearProps: 'height' });
		},
	});
}
