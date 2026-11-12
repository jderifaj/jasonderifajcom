import gsap from 'gsap';

/**
 * Flies the route map in (src/components/RouteMap.astro), like an aerial shot pulling back:
 * the camera starts close on Athens, its dot pops and its label is uncovered, then each leg
 * draws north while the camera pans and widens to keep the line in view. Each stop's dot pops
 * as its strands arrive. A sparse lattice draws in near the route as the line passes.
 *
 * Each label names its city when its dot pops, and keeps it until the next city appears; then
 * it changes to what I do there (Washington, the last stop, changes a beat after it appears).
 *
 * The camera is the SVG's viewBox. Dots and labels are HTML, repositioned from the viewBox on
 * every update, so they keep their size; line widths follow the zoom through --unit.
 */

const LEG_SECONDS = [3.4, 2.6, 2]; // how long each leg takes to draw
const CAMERA_LAG = 0.25; // the camera settles a little after the line arrives
const HOLD = 0.55; // pause at each stop before the next leg leaves
const START_WIDTH = 0.3; // the opening shot, as a share of the full frame's width
/** Which side of its dot a stop's label is on (phones can override it; see src/data/route.ts). */
const sideOf = (stop) =>
	stop.dataset.phoneSide && matchMedia('(max-width: 640px)').matches ? stop.dataset.phoneSide : stop.dataset.side;

const CHANGE_AFTER = 0.35; // a stop's label changes this long after the next city's dot appears
const LAST_CHANGE = 1.4; // nothing follows the last stop: its label changes this long after it appears

/**
 * Gives the CSS the copy's height (--copy-h), which it solves the map's size from on wide
 * screens: as big as fits between the white band and the URL (see .copy--route in global.css).
 */
export function measureCopy() {
	const copy = document.querySelector('.copy--route');
	if (!copy) return;
	const set = () => copy.style.setProperty('--copy-h', `${copy.clientHeight}px`);
	set();
	new ResizeObserver(set).observe(copy);
}

/**
 * Keeps line widths steady on screen: sets --unit, the map units per screen pixel, from the
 * current viewBox. Called on every camera move, and on load and resize for the still map.
 */
export function sizeRoute() {
	const svg = document.querySelector('[data-route] .route-map');
	if (!svg) return;
	const unit = () => svg.viewBox.baseVal.width / (svg.getBoundingClientRect().width || 1);
	svg.style.setProperty('--unit', unit().toFixed(4));
	if (!svg.dataset.sized) {
		svg.dataset.sized = 'yes';
		window.addEventListener('resize', () => svg.style.setProperty('--unit', unit().toFixed(4)));
	}
}

export function drawRoute() {
	const root = document.querySelector('[data-route]');
	if (!root) return;

	const svg = root.querySelector('.route-map');
	const W = +root.dataset.width;
	const H = +root.dataset.height;
	const stops = [...root.querySelectorAll('.stop')].map((el) => ({ el, x: +el.dataset.x, y: +el.dataset.y }));
	const strands = [...root.querySelectorAll('.route-strand')];
	const lattice = [...root.querySelectorAll('.route-lattice line')];

	// Camera framings: close on Athens, then each one takes in the route so far, ending on the full frame.
	const frame = (points, minWidth) => {
		const xs = points.map((p) => p.x);
		const ys = points.map((p) => p.y);
		let w = Math.max(minWidth, (Math.max(...xs) - Math.min(...xs)) * 1.6, ((Math.max(...ys) - Math.min(...ys)) * 1.6 * W) / H);
		w = Math.min(w, W);
		return { cx: (Math.min(...xs) + Math.max(...xs)) / 2, cy: (Math.min(...ys) + Math.max(...ys)) / 2, w };
	};
	const shots = [
		frame([stops[0]], W * START_WIDTH),
		frame(stops.slice(0, 2), W * 0.55),
		frame(stops.slice(0, 3), W * 0.75),
		{ cx: W / 2, cy: H / 2, w: W },
	];

	// Labels start on the city names; each changes to its role as the route moves on.
	for (const { el } of stops) el.querySelector('.city-text').textContent = el.dataset.city;

	const camera = { ...shots[0] };
	const place = () => {
		const h = (camera.w * H) / W;
		// Keep the shot inside the map.
		const x = gsap.utils.clamp(0, W - camera.w, camera.cx - camera.w / 2);
		const y = gsap.utils.clamp(0, H - h, camera.cy - h / 2);
		svg.setAttribute('viewBox', `${x} ${y} ${camera.w} ${h}`);
		sizeRoute();
		for (const stop of stops) {
			stop.el.style.left = `${((stop.x - x) / camera.w) * 100}%`;
			stop.el.style.top = `${((stop.y - y) / h) * 100}%`;
		}
	};
	place();

	const timeline = gsap.timeline({ onUpdate: place });
	timeline.to(svg, { opacity: 1, duration: 0.8, ease: 'sine.out' }, 0);
	timeline.add(revealStop(stops[0].el), 0.2);

	let at = 0.2 + 0.9;
	LEG_SECONDS.forEach((seconds, leg) => {
		const mine = strands.filter((s) => +s.dataset.leg === leg);
		timeline
			.to(camera, { ...shots[leg + 1], duration: seconds + CAMERA_LAG, ease: 'power1.inOut' }, at)
			.fromTo(
				mine,
				{ strokeDashoffset: 1 },
				{ strokeDashoffset: 0, duration: seconds, ease: 'sine.inOut', stagger: 0.18, autoRound: false },
				at,
			);

		// Lattice near this leg draws as the line passes it, slowly and faintly.
		for (const line of lattice.filter((l) => +l.dataset.leg === leg)) {
			const passes = at + seconds * +line.dataset.t;
			timeline.fromTo(
				line,
				{ strokeDashoffset: Math.random() < 0.5 ? 1 : -1 },
				{ strokeDashoffset: 0, duration: gsap.utils.random(1.2, 2.2), ease: 'sine.inOut', autoRound: false },
				passes + gsap.utils.random(-0.1, 0.5),
			);
		}

		// The next stop's dot pops as its strands arrive.
		const arrive = at + seconds + 0.18 * (mine.length - 1) - 0.1;
		timeline
			.add(revealStop(stops[leg + 1].el), arrive)
			.add(changeLabel(stops[leg].el), arrive + CHANGE_AFTER);
		at = arrive + HOLD;
	});

	timeline.add(changeLabel(stops.at(-1).el), at - HOLD + LAST_CHANGE);
}

/**
 * The city name becomes what I do there, slowly: the plate eases to its new length, the
 * name drifts up and softens away, a band of light sweeps across, and the new words rise
 * in letter by letter, each coming into focus.
 */
function changeLabel(stop) {
	const label = stop.querySelector('.city-label');
	const text = stop.querySelector('.city-text');
	const shine = stop.querySelector('.city-shine');
	const role = stop.dataset.role;
	const fromLeft = sideOf(stop) === 'left';

	let toWidth = 0;

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
					span.textContent = char === ' ' ? '\u00a0' : char;
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
		}, 2.2);
}

/** The dot pops, then a blue bar slides out from it, the label appears under it, and the bar slides off. */
function revealStop(stop) {
	const dot = stop.querySelector('.city-dot');
	const wipe = stop.querySelector('.city-wipe');
	const label = stop.querySelectorAll('.city-plate, .city-text');
	// The bar grows from the dot's side and leaves from the far side.
	const near = sideOf(stop) === 'left' ? '100% 50%' : '0% 50%';
	const far = sideOf(stop) === 'left' ? '0% 50%' : '100% 50%';

	return gsap.timeline()
		.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' })
		.fromTo(wipe, { scaleX: 0, transformOrigin: near }, { scaleX: 1, duration: 0.4, ease: 'power3.in' }, '>-0.15')
		.set(label, { opacity: 1 })
		.set(wipe, { transformOrigin: far })
		.to(wipe, { scaleX: 0, duration: 0.5, ease: 'power3.out' });
}
