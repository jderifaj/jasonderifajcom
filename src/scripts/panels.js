import gsap from 'gsap';
import { prefersReducedMotion } from './motion.js';

/**
 * Opens and closes the full-screen panels.
 *
 * Browsers that support invoker commands (commandfor/command) open and close
 * the dialogs without any script; older ones get the same behaviour here.
 */
export function initPanels() {
	const hasInvokers = 'commandForElement' in HTMLButtonElement.prototype;

	for (const button of document.querySelectorAll('[data-open]')) {
		button.addEventListener('click', () => {
			const dialog = document.getElementById(button.dataset.open);
			if (!dialog) return;
			if (!hasInvokers && !dialog.open) dialog.showModal();
			requestAnimationFrame(() => dialog.open && animateIn(dialog));
		});
	}

	openFromHash();

	if (hasInvokers) return;
	for (const button of document.querySelectorAll('[data-close]')) {
		button.addEventListener('click', () => button.closest('dialog')?.close());
	}
}

/** A link to /#work (such as "Back to work" on a case study) arrives with that panel open. */
function openFromHash() {
	const id = decodeURIComponent(location.hash.slice(1));
	const dialog = id && document.getElementById(id);
	if (!(dialog instanceof HTMLDialogElement) || !dialog.classList.contains('panel')) return;

	dialog.showModal();
	animateIn(dialog);
	// Drop the hash so closing the panel and reloading lands on the poster.
	history.replaceState(null, '', location.pathname + location.search);
}

/** Slides the header down, lifts the content in and draws the rules across. */
function animateIn(dialog) {
	if (prefersReducedMotion()) return;

	const content = dialog.querySelectorAll('.work-row, .earlier, .recommendations > li');
	const rules = dialog.querySelectorAll('.work-rule');

	gsap.timeline({ defaults: { ease: 'power3.out' } })
		.from(dialog.querySelector('.panel-head'), { yPercent: -100, duration: 0.5 })
		.from(content, { y: 24, opacity: 0, stagger: 0.05, duration: 0.5 }, 0.15)
		.fromTo(rules, { width: '0%' }, { width: '100%', stagger: 0.05, duration: 0.6, ease: 'power2.inOut' }, 0.3);
}
