import gsap from 'gsap';
import { hasFinePointer, pointerOffset } from './motion.js';

/**
 * Draws the route map in (src/components/RouteMap.astro), like a technical drawing being
 * plotted: the crosshairs and coordinates come up, the states trace their outlines one after
 * another, then the route. Athens' node appears, its leader drops to the label axis and a bar
 * uncovers its label; each leg then draws north to the next stop, whose leader rises and turns
 * to the axis.
 *
 * Each label names its city when its dot pops, and keeps it. Under the city, a line shows what
 * happened there (one moment or a few, in turn) before the next leg leaves; when the next city
 * appears it lands on what I do there (Washington, the last stop, lands a beat after its
 * moment). Every phrase holds still at least PAUSE seconds before the next one starts.
 *
 * Once it has finished, hovering a label with a mouse replays its line (the moments, then what I
 * do there); moving off returns it to rest.
 *
 * The map holds still on the whole route, so the labels stay on their axis. With a mouse, the
 * background layers (the crosshairs, the states) shift slightly against the pointer, behind
 * the route and its labels, which stay put.
 */

const STATE = { duration: 1.4, stagger: 0.12 }; // then the states trace their outlines
const LEG_SECONDS = [1.8, 1.4, 1.1]; // how long each leg takes to draw
const PAUSE = 0.3; // every phrase, the city included, holds still at least this long before the next one starts
const CHANGE_AFTER = 0.35; // a stop's label lands on its role this long after the next city's dot appears
const LAST_READ = 1.4; // nothing follows the last stop: its last moment holds this much longer before the role
/** How far each background layer drifts with the pointer, in map units, from centre to edge. */
const DEPTH = { grid: 12, states: 6 };

/**
 * Gives the CSS the copy's height (--copy-h) and the room from under the navigation to the
 * copy's foot (--room), which it solves the map's size from on wide screens (see .copy--route
 * in global.css).
 */
export function measureCopy() {
	const copy = document.querySelector('.copy--route');
	if (!copy) return;
	const nav = document.querySelector('.tiles');
	const set = () => {
		copy.style.setProperty('--copy-h', `${copy.clientHeight}px`);
		// The room from under the navigation to the foot of the copy, which the map can fill
		if (nav) copy.style.setProperty('--room', `${copy.getBoundingClientRect().bottom - nav.getBoundingClientRect().bottom}px`);
	};
	set();
	new ResizeObserver(set).observe(copy);
	window.addEventListener('resize', set);
}

/**
 * Keeps line widths steady on screen: sets --unit, the map units per screen pixel, which the
 * CSS multiplies hairline widths and the coordinates' type size by. Called on load and resize.
 * (Lines that draw on can't use non-scaling-stroke: with it, the browser measures the dash in
 * screen pixels, so pathLength="1" no longer spans the line.)
 */
export function sizeRoute() {
	const svg = document.querySelector('[data-route] .route-map');
	if (!svg) return;
	const unit = () => svg.viewBox.baseVal.width / (svg.getBoundingClientRect().width || 1);
	const set = () => svg.style.setProperty('--unit', unit().toFixed(4));
	set();
	new ResizeObserver(set).observe(svg);
}

export function drawRoute() {
	const root = document.querySelector('[data-route]');
	if (!root) return;

	const svg = root.querySelector('.route-map');
	const stops = [...root.querySelectorAll('.stop')];
	const strands = [...root.querySelectorAll('.route-strand')];
	const states = [...root.querySelectorAll('.route-state')];

	// Labels start on the city alone; the line under it steps through the moments, then the role.
	for (const stop of stops) stop.querySelector('.city-text').textContent = '\u00a0';

	const timeline = gsap.timeline();
	timeline
		.to(svg, { opacity: 1, duration: 0.4, ease: 'sine.out' }, 0)
		.fromTo(root.querySelectorAll('.route-cross, .route-coord'), { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'sine.out' }, 0.2)
		.fromTo(
			states,
			{ strokeDashoffset: 1 },
			{ strokeDashoffset: 0, duration: STATE.duration, ease: 'sine.inOut', stagger: STATE.stagger, autoRound: false },
			0.5,
		);

	// When each stop's label may next change: its current phrase has landed and held for PAUSE.
	const readyAt = new Map();
	const change = (stop, to, time) => {
		const at = Math.max(time, readyAt.get(stop) ?? 0);
		const tl = changeLabel(stop, to);
		timeline.add(tl, at);
		readyAt.set(stop, at + tl.duration() + PAUSE);
		return at;
	};

	/** Reveals a stop on its city, then steps through its moments; returns when the next leg can leave. */
	const arriveAt = (stop, time) => {
		const reveal = revealStop(stop);
		timeline.add(reveal, time);
		readyAt.set(stop, time + reveal.duration() + PAUSE);
		const moments = JSON.parse(stop.dataset.moments || '[]');
		for (const moment of moments) change(stop, moment, 0);
		return readyAt.get(stop);
	};

	let at = arriveAt(stops[0], 0.5 + STATE.stagger * (states.length - 1) + STATE.duration * 0.5);

	LEG_SECONDS.forEach((seconds, leg) => {
		timeline.fromTo(
			strands.filter((s) => +s.dataset.leg === leg),
			{ strokeDashoffset: 1 },
			{ strokeDashoffset: 0, duration: seconds, ease: 'sine.inOut', autoRound: false },
			at,
		);

		// The next stop's node appears as the line arrives.
		const arrive = at + seconds - 0.1;
		change(stops[leg], stops[leg].dataset.role, arrive + CHANGE_AFTER);
		at = arriveAt(stops[leg + 1], arrive);
	});

	const last = stops.at(-1);
	change(last, last.dataset.role, readyAt.get(last) + LAST_READ);

	if (hasFinePointer()) {
		followPointer(root);
		timeline.eventCallback('onComplete', () => {
			replayOnHover(stops);
			root.dataset.replay = 'ready';
		});
	}
}

/**
 * Hovering a label replays its moments, then its role, PAUSE apart; moving off puts it back at
 * rest. The copy lies over the map and takes the pointer, so this hit-tests the labels' boxes
 * as the pointer moves rather than listening on the labels.
 */
function replayOnHover(stops) {
	const replays = stops.map(labelReplay);
	let current = null;
	window.addEventListener('pointermove', (event) => {
		if (event.pointerType !== 'mouse') return;
		const over = replays.find(({ label }) => {
			const box = label.getBoundingClientRect();
			return event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
		});
		if (over === current) return;
		current?.leave();
		current = over ?? null;
		current?.enter();
		// The labels can't take the pointer, so the page shows their cursor (see .is-over-label)
		document.documentElement.classList.toggle('is-over-label', Boolean(current));
	});
	document.documentElement.addEventListener('pointerleave', () => {
		current?.leave();
		current = null;
		document.documentElement.classList.remove('is-over-label');
	});
}

/** One label's replay: enter() plays its line through, leave() returns it to rest. */
function labelReplay(stop) {
	const label = stop.querySelector('.city-label');
	const text = stop.querySelector('.city-text');
	const shine = stop.querySelector('.city-shine');
	const { role } = stop.dataset;
	const moments = JSON.parse(stop.dataset.moments || '[]');
	let replay = null;

	const halt = () => {
		replay?.kill();
		replay = null;
		gsap.killTweensOf([label, text, shine, ...text.children]);
	};

	const enter = () => {
		halt();
		replay = gsap.timeline();
		let at = 0;
		for (const phrase of [...moments, role]) {
			const change = changeLabel(stop, phrase);
			replay.add(change, at);
			at += change.duration() + PAUSE;
		}
	};

	const leave = () => {
		if (!replay) return;
		halt();
		// Back to rest: the role, fading in at its natural width.
		text.textContent = role;
		gsap.set(label, { clearProps: 'width' });
		gsap.set(shine, { opacity: 0 });
		gsap.fromTo(text, { yPercent: 0, opacity: 0, filter: 'none' }, { opacity: 1, duration: 0.3, ease: 'sine.out' });
	};

	return { label, enter, leave };
}

/** The background layers drift against the pointer, the grid furthest, as if further back; the name drifts with it. */
function followPointer(root) {
	const layers = [...root.querySelectorAll('[data-depth]')].map((layer) => ({
		depth: DEPTH[layer.dataset.depth],
		x: gsap.quickTo(layer, 'x', { duration: 1.4, ease: 'power3.out' }),
		y: gsap.quickTo(layer, 'y', { duration: 1.4, ease: 'power3.out' }),
	}));

	// The name, in front, drifts the other way, a little.
	const name = document.querySelector('.name');
	const nameX = name && gsap.quickTo(name, 'x', { duration: 1.6, ease: 'power3.out' });

	window.addEventListener('pointermove', (event) => {
		const { x, y } = pointerOffset(event);
		for (const layer of layers) {
			layer.x(x * -2 * layer.depth);
			layer.y(y * -2 * layer.depth);
		}
		nameX?.(x * 16);
	});
}

/** Labels hang left of their leader (rising leaders), or right of it (Athens' drop). */
const rises = (stop) => stop.dataset.leader === 'up';

/**
 * The label's words become `to` (a moment, or what I do there), slowly: the plate eases to its new length, the
 * name drifts up and softens away, a band of light sweeps across, and the new words rise
 * in letter by letter, each coming into focus.
 */
function changeLabel(stop, role) {
	const label = stop.querySelector('.city-label');
	const text = stop.querySelector('.city-text');
	const shine = stop.querySelector('.city-shine');
	const fromLeft = !rises(stop);

	let toWidth = 0;
	// The new words have landed once the last letter is in (see the stagger below).
	const landed = 0.6 + 0.9 + 0.022 * Math.max(role.length - 1, 0);

	return gsap.timeline()
		.add(() => {
			// Measure the plate at both lengths, then hold it at the old one while it eases.
			const fromWidth = label.offsetWidth;
			const name = text.textContent;
			text.textContent = role;
			toWidth = label.offsetWidth;
			text.textContent = name;
			gsap.set(label, { width: fromWidth });
		})
		.to(text, { yPercent: -70, opacity: 0, filter: 'blur(5px)', duration: 0.55, ease: 'power2.in' }, 0)
		.to(label, { width: () => toWidth, duration: 1.1, ease: 'expo.inOut' }, 0.05)
		.fromTo(
			shine,
			{ backgroundPosition: fromLeft ? '-60% 0' : '160% 0', opacity: 1 },
			{ backgroundPosition: fromLeft ? '160% 0' : '-60% 0', duration: 1.3, ease: 'sine.inOut' },
			0.15,
		)
		.add(() => {
			text.replaceChildren(
				...[...role].map((char) => {
					const span = document.createElement('span');
					span.className = 'city-letter';
					span.textContent = char === ' ' ? ' ' : char;
					return span;
				}),
			);
			gsap.set(text, { yPercent: 0, opacity: 1, filter: 'none' });
			gsap.fromTo(
				text.children,
				{ yPercent: 90, opacity: 0, filter: 'blur(6px)' },
				{ yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out', stagger: 0.022, delay: 0.05 },
			);
		}, 0.55)
		.add(() => {
			// Back to plain text and a natural width once it has settled.
			text.textContent = role;
			gsap.set(label, { clearProps: 'width' });
			gsap.set(shine, { opacity: 0 });
		}, Math.max(landed, 1.45));
}

/**
 * The node appears and its leader draws out to the label axis: the upright first, then (for a
 * rising leader) the run along to the axis. A bar slides out from where the leader
 * arrives, the label appears under it, and the bar slides off.
 */
function revealStop(stop) {
	const dot = stop.querySelector('.city-dot');
	const leader = stop.querySelector('.leader');
	const wipe = stop.querySelector('.city-wipe');
	const label = stop.querySelectorAll('.city-plate, .city-index, .city-name, .city-text');
	// The bar grows from the leader's side of the label and leaves from the far side.
	const near = rises(stop) ? '100% 50%' : '0% 50%';
	const far = rises(stop) ? '0% 50%' : '100% 50%';

	return gsap.timeline()
		.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.35, ease: 'power3.out' })
		.fromTo(leader, { '--rise': 0, '--run': 0 }, { '--rise': 1, duration: 0.35, ease: 'power2.inOut' }, '>-0.2')
		.to(leader, { '--run': 1, duration: rises(stop) ? 0.5 : 0, ease: 'power2.inOut' })
		.fromTo(wipe, { scaleX: 0, transformOrigin: near }, { scaleX: 1, duration: 0.35, ease: 'power3.in' }, '>-0.05')
		.set(label, { opacity: 1 })
		.add(() => stop.classList.add('is-shown'))
		.set(wipe, { transformOrigin: far })
		.to(wipe, { scaleX: 0, duration: 0.5, ease: 'power3.out' });
}
