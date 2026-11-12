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
		.from(dialog.querySelectorAll('.item .group, .archive, .comments li'), { y: 24, opacity: 0, stagger: 0.05, duration: 0.5 }, 0.15)
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

// Hovering or focusing a project shows its screenshot, enlarged, in the lower right.
// The card rises in, new screenshots wipe up over the old one, and the blue shadow drifts with the pointer.
function workPreview() {
	const panel = document.getElementById('work');
	const box = panel?.querySelector('.work-preview');
	if (!box) return;
	const frame = box.querySelector('.work-preview-frame');
	const shadow = box.querySelector('.work-preview-shadow');
	const layers = [...frame.querySelectorAll('img')];
	const calm = reduceMotion();

	let front = 0;
	let current = '';
	let visible = false;
	let hideCall;

	gsap.set(box, { autoAlpha: 0, y: 48, scale: 0.88, rotation: -4, transformOrigin: '100% 100%' });
	gsap.set(shadow, { x: 12, y: 12 });
	gsap.set(layers, { autoAlpha: 0 });

	const reveal = () => {
		hideCall?.kill();
		if (visible) return;
		visible = true;
		gsap.to(box, {
			autoAlpha: 1, y: 0, scale: 1, rotation: 0,
			duration: calm ? 0.3 : 1.2,
			ease: calm ? 'none' : 'elastic.out(1, 0.75)',
			overwrite: 'auto',
			// Drop the transform once settled: a transformed layer is resampled and looks soft.
			onComplete: () => gsap.set(box, { clearProps: 'transform' }),
		});
	};

	const hide = (now = false) => {
		hideCall?.kill();
		const out = () => {
			visible = false;
			gsap.to(box, {
				autoAlpha: 0, y: 28, scale: 0.94, rotation: 2.5,
				duration: now ? 0 : 0.55, ease: 'power3.in', overwrite: 'auto',
			});
		};
		if (now) out();
		else hideCall = gsap.delayedCall(0.2, out); // grace period while moving between rows
	};

	const swap = async (src) => {
		if (!src || src === current) return;
		current = src;
		const next = layers[1 - front];
		const prev = layers[front];
		next.src = src;
		try { await next.decode(); } catch { /* show it anyway */ }
		if (src !== current) return; // the pointer has already moved on
		front = 1 - front;
		gsap.killTweensOf([next, prev]);
		gsap.set(next, { zIndex: 2 });
		gsap.set(prev, { zIndex: 1 });

		if (calm) {
			gsap.fromTo(next, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 });
			gsap.to(prev, { autoAlpha: 0, duration: 0.25 });
			return;
		}
		gsap.fromTo(next,
			{ autoAlpha: 1, clipPath: 'inset(100% 0% 0% 0%)', scale: 1.22, yPercent: 6 },
			{ clipPath: 'inset(0% 0% 0% 0%)', scale: 1, yPercent: 0, duration: 1.15, ease: 'expo.out',
				onComplete: () => gsap.set(next, { clearProps: 'transform,clipPath' }) });
		gsap.to(prev, { autoAlpha: 0, scale: 1.08, yPercent: -4, filter: 'blur(6px)', duration: 0.9, ease: 'power2.out',
			onComplete: () => gsap.set(prev, { clearProps: 'transform,filter' }) });
	};

	const links = [...panel.querySelectorAll('a[data-preview]')];
	links.forEach((link) => {
		const show = () => { reveal(); swap(link.dataset.preview); };
		link.addEventListener('pointerenter', show);
		link.addEventListener('focus', show);
		link.addEventListener('pointerleave', () => hide());
		link.addEventListener('blur', () => hide());
	});
	panel.addEventListener('close', () => hide(true));

	// Fetch the screenshots the first time the panel opens, so the first hover is instant.
	let warmed = false;
	document.querySelector('[data-open="work"]')?.addEventListener('click', () => {
		if (warmed) return;
		warmed = true;
		setTimeout(() => links.forEach((link) => { new Image().src = link.dataset.preview; }), 600);
	});

	// The blue shadow trails the pointer for a little depth; the screenshot itself stays flat and sharp.
	if (calm || !window.matchMedia('(pointer: fine)').matches) return;
	const shadowX = gsap.quickTo(shadow, 'x', { duration: 1.4, ease: 'power3.out' });
	const shadowY = gsap.quickTo(shadow, 'y', { duration: 1.4, ease: 'power3.out' });
	panel.addEventListener('pointermove', (e) => {
		const dx = e.clientX / window.innerWidth - 0.5;
		const dy = e.clientY / window.innerHeight - 0.5;
		shadowX(12 - dx * 16);
		shadowY(12 - dy * 12);
	});
}

export function initHome() {
	intro();
	panels();
	workPreview();
}
