import gsap from 'gsap';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function intro() {
	if (reduceMotion()) return;

	gsap.timeline({ defaults: { ease: 'power3.out' } })
		.from('.poster-photo', { scale: 1.12, duration: 2.4, ease: 'power2.out' }, 0)
		.from('.band', { clipPath: 'inset(0 100% 0 0)', duration: 0.9, ease: 'power4.inOut' }, 0.15)
		.from('.band-title > *', { yPercent: 60, opacity: 0, stagger: 0.12, duration: 0.7 }, 0.6)
		.from('.logo span', { opacity: 0, scale: 0.5, stagger: 0.06, duration: 0.4 }, 0.8)
		.from('.mono-tile', { opacity: 0, y: 60, stagger: 0.15, duration: 1.1 }, 0.7)
		.from('.lines li', { x: -40, opacity: 0, stagger: 0.09, duration: 0.7 }, 0.9)
		.from('.lines .dash', { scaleX: 0, stagger: 0.09, duration: 0.5 }, 1.25)
		.from(['.poster-url', '.poster-meta'], { opacity: 0, y: 16, stagger: 0.12, duration: 0.6 }, 1.35)
		.from('.cta', { opacity: 0, y: 30, stagger: 0.12, duration: 0.7 }, 1.5);

	// Subtle parallax: the portrait drifts against the pointer, the monogram with it.
	if (!window.matchMedia('(pointer: fine)').matches) return;
	const photoX = gsap.quickTo('.poster-photo', 'x', { duration: 1.2, ease: 'power3.out' });
	const photoY = gsap.quickTo('.poster-photo', 'y', { duration: 1.2, ease: 'power3.out' });
	const monoX = gsap.quickTo('.mono', 'x', { duration: 1.6, ease: 'power3.out' });
	window.addEventListener('pointermove', (e) => {
		const dx = e.clientX / window.innerWidth - 0.5;
		const dy = e.clientY / window.innerHeight - 0.5;
		photoX(dx * -24);
		photoY(dy * -16);
		monoX(dx * 18);
	});
}

function animatePanel(dialog) {
	if (reduceMotion()) return;
	gsap.timeline({ defaults: { ease: 'power3.out' } })
		.from(dialog.querySelector('.panel-head'), { yPercent: -100, duration: 0.5 })
		.from(dialog.querySelectorAll('.item .group, .comments li'), { y: 24, opacity: 0, stagger: 0.05, duration: 0.5 }, 0.15)
		.fromTo(dialog.querySelectorAll('.line'), { width: '0%' }, { width: '100%', stagger: 0.05, duration: 0.6, ease: 'power2.inOut' }, 0.3);
}

// Browsers with invoker commands (commandfor/command) open and close the dialogs
// on their own; older ones get the same behaviour from these handlers.
function panels() {
	const native = 'commandForElement' in HTMLButtonElement.prototype;

	document.querySelectorAll('[data-open]').forEach((btn) => {
		btn.addEventListener('click', () => {
			const dialog = document.getElementById(btn.dataset.open);
			if (!dialog) return;
			if (!native && !dialog.open) dialog.showModal();
			requestAnimationFrame(() => dialog.open && animatePanel(dialog));
		});
	});

	if (!native) {
		document.querySelectorAll('[data-close]').forEach((btn) => {
			btn.addEventListener('click', () => btn.closest('dialog')?.close());
		});
	}
}

// Hovering or focusing a project shows its thumbnail, enlarged, in the lower right.
function workPreview() {
	const box = document.querySelector('#work .work-preview');
	if (!box) return;
	const big = box.querySelector('img');

	const show = (link) => {
		const thumb = link.querySelector('.photo img');
		if (!thumb) return;
		big.src = thumb.dataset.preview || thumb.currentSrc || thumb.src;
		box.classList.add('is-visible');
	};
	const hide = () => box.classList.remove('is-visible');

	document.querySelectorAll('#work .item a').forEach((link) => {
		link.addEventListener('pointerenter', () => show(link));
		link.addEventListener('pointerleave', hide);
		link.addEventListener('focus', () => show(link));
		link.addEventListener('blur', hide);
	});
	document.getElementById('work').addEventListener('close', hide);
}

export function initHome() {
	intro();
	panels();
	workPreview();
}
