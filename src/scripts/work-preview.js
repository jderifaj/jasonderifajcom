import gsap from 'gsap';
import { hasFinePointer, pointerOffset, prefersReducedMotion } from './motion.js';

/**
 * Hovering or focusing a project shows its screenshot, enlarged, in the lower right.
 *
 * The card springs in, each new screenshot wipes up over the last, and the blue
 * shadow trails the pointer. Every transform is cleared once an animation
 * settles: a transformed layer is resampled by the browser and looks soft.
 */
export function initWorkPreview() {
	const panel = document.getElementById('work');
	const card = panel?.querySelector('.work-preview');
	if (!card) return;

	// Mostly links; a project with no live site is a plain row, which shows its preview on hover only.
	const links = [...panel.querySelectorAll('[data-preview]')];
	const preview = createPreview(card);

	for (const link of links) {
		const show = () => preview.show(link.dataset.preview);
		link.addEventListener('pointerenter', show);
		link.addEventListener('focus', show);
		link.addEventListener('pointerleave', () => preview.hide());
		link.addEventListener('blur', () => preview.hide());
	}
	panel.addEventListener('close', () => preview.hide({ immediately: true }));

	preloadOnFirstOpen(links);
	if (!prefersReducedMotion() && hasFinePointer()) trailShadow(panel, card);
}

function createPreview(card) {
	const calm = prefersReducedMotion();
	const frame = card.querySelector('.work-preview-frame');

	// Two stacked layers so one screenshot can wipe in over the other. They are made
	// here rather than in the HTML so the page never ships an <img> without a src.
	const layers = [0, 1].map(() => {
		const img = document.createElement('img');
		img.alt = '';
		img.decoding = 'async';
		frame.append(img);
		return img;
	});

	let front = 0;
	let currentSrc = '';
	let visible = false;
	let pendingHide;

	gsap.set(card, { autoAlpha: 0, y: 48, scale: 0.88, rotation: -4, transformOrigin: '100% 100%' });
	gsap.set(layers, { autoAlpha: 0 });

	function reveal() {
		pendingHide?.kill();
		if (visible) return;
		visible = true;
		gsap.to(card, {
			autoAlpha: 1,
			y: 0,
			scale: 1,
			rotation: 0,
			duration: calm ? 0.3 : 1.2,
			ease: calm ? 'none' : 'elastic.out(1, 0.75)',
			overwrite: 'auto',
			onComplete: () => gsap.set(card, { clearProps: 'transform' }),
		});
	}

	function hide({ immediately = false } = {}) {
		pendingHide?.kill();
		const out = () => {
			visible = false;
			gsap.to(card, {
				autoAlpha: 0,
				y: 28,
				scale: 0.94,
				rotation: 2.5,
				duration: immediately ? 0 : 0.55,
				ease: 'power3.in',
				overwrite: 'auto',
			});
		};
		// A short grace period, so moving between rows swaps the image instead of hiding the card.
		if (immediately) out();
		else pendingHide = gsap.delayedCall(0.2, out);
	}

	async function swapTo(src) {
		if (!src || src === currentSrc) return;
		currentSrc = src;

		const incoming = layers[1 - front];
		const outgoing = layers[front];
		incoming.src = src;
		try {
			await incoming.decode();
		} catch {
			// Show it anyway; the browser will paint it when it can.
		}
		if (src !== currentSrc) return; // the pointer has already moved on

		front = 1 - front;
		gsap.killTweensOf(layers);
		// A layer pulled back mid-fade still carries that fade's blur and zoom.
		gsap.set(incoming, { clearProps: 'filter,transform,clipPath', zIndex: 2 });
		gsap.set(outgoing, { zIndex: 1 });

		if (calm) {
			gsap.fromTo(incoming, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 });
			gsap.to(outgoing, { autoAlpha: 0, duration: 0.25 });
			return;
		}

		gsap.fromTo(
			incoming,
			{ autoAlpha: 1, clipPath: 'inset(100% 0% 0% 0%)', scale: 1.22, yPercent: 6 },
			{
				clipPath: 'inset(0% 0% 0% 0%)',
				scale: 1,
				yPercent: 0,
				duration: 1.15,
				ease: 'expo.out',
				onComplete: () => gsap.set(incoming, { clearProps: 'transform,clipPath' }),
			},
		);
		gsap.to(outgoing, {
			autoAlpha: 0,
			scale: 1.08,
			yPercent: -4,
			filter: 'blur(6px)',
			duration: 0.9,
			ease: 'power2.out',
			onComplete: () => gsap.set(outgoing, { clearProps: 'transform,filter' }),
		});
	}

	return {
		show(src) {
			reveal();
			swapTo(src);
		},
		hide,
	};
}

/** Fetch every screenshot shortly after the panel first opens, so the first hover is instant. */
function preloadOnFirstOpen(links) {
	const opener = document.querySelector('[data-open="work"]');
	opener?.addEventListener(
		'click',
		() => setTimeout(() => links.forEach((link) => (new Image().src = link.dataset.preview)), 600),
		{ once: true },
	);
}

/** The blue shadow drifts with the pointer for a little depth; the screenshot itself stays still. */
function trailShadow(panel, card) {
	const shadow = card.querySelector('.work-preview-shadow');
	const restingOffset = 12;
	gsap.set(shadow, { x: restingOffset, y: restingOffset });

	const shadowX = gsap.quickTo(shadow, 'x', { duration: 1.4, ease: 'power3.out' });
	const shadowY = gsap.quickTo(shadow, 'y', { duration: 1.4, ease: 'power3.out' });

	panel.addEventListener('pointermove', (event) => {
		const { x, y } = pointerOffset(event);
		shadowX(restingOffset - x * 16);
		shadowY(restingOffset - y * 12);
	});
}
