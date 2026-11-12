import gsap from 'gsap';

/**
 * Brings North Carolina in once the poster is most of the way in: the outline fades up
 * and the lattice draws itself, and each city's dot pops the moment the growing lines
 * meet at it. Then a blue bar wipes across and uncovers its label.
 *
 * The lattice grows like frost. Clusters start at nodes; whenever a line finishes, the
 * lines leaving its far end start after a pause. The first clusters start beside the
 * cities, in order (Cary, Charlotte, Asheville, Wilmington), and lines near a city draw
 * quickly so its intersection forms soon. Away from the cities the lines stay slow and
 * faint, so the movement stays in the background.
 */

const PAUSE = [0.4, 2.6]; // wait at a node before a line leaves it
const DRAW = [2.2, 4]; // how long one line takes to draw
const NEAR = { fast: 0.3, within: 90, until: 260 }; // near a city: 0.3× the time, easing back to 1× by 260 units away
const CITY_SEEDS = { first: 0.2, every: 1.35 }; // when the cluster beside each city starts
const EXTRA_SEEDS = { count: 3, from: 3, to: 8 }; // a few more clusters elsewhere, later
const ORDER_GAP = 0.8; // seconds between one city's dot and the next, at least

const between = ([min, max]) => min + Math.random() * (max - min);
const pickFrom = (items) => items[Math.floor(Math.random() * items.length)];

export function drawState() {
	const outline = document.querySelector('.state-line');
	const lines = [...document.querySelectorAll('.state-truss line')];
	const cities = [...document.querySelectorAll('.city')];
	if (!outline) return;

	const plan = planLattice(lines, cities);

	const timeline = gsap.timeline();
	timeline.to(outline, { opacity: 1, duration: 1.4, ease: 'sine.inOut' }, 0);
	for (const { line, start, duration, forwards } of plan.lines) {
		// pathLength is 1: an offset of 1 hides the line; -1 hides it from the other end.
		// autoRound is off because GSAP would otherwise round these tiny values to whole pixels.
		timeline.fromTo(
			line,
			{ strokeDashoffset: forwards ? 1 : -1 },
			{ strokeDashoffset: 0, duration, ease: 'sine.inOut', autoRound: false, immediateRender: false },
			0.3 + start,
		);
	}
	cities.forEach((city, i) => timeline.add(revealCity(city), 0.3 + plan.meets[i]));
}

/** The dot pops, then the blue bar slides out from it, the label appears under it, and the bar slides off. */
function revealCity(city) {
	const dot = city.querySelector('.city-dot');
	const wipe = city.querySelector('.city-wipe');
	const label = city.querySelectorAll('.city-plate, .city-text');
	// The bar grows from the dot's side and leaves from the far side.
	const near = city.dataset.side === 'left' ? '100% 50%' : '0% 50%';
	const far = city.dataset.side === 'left' ? '0% 50%' : '100% 50%';

	return gsap.timeline()
		.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' })
		.fromTo(wipe, { scaleX: 0, transformOrigin: near }, { scaleX: 1, duration: 0.45, ease: 'power3.in' }, '>-0.15')
		.set(label, { opacity: 1 })
		.set(wipe, { transformOrigin: far })
		.to(wipe, { scaleX: 0, duration: 0.55, ease: 'power3.out' });
}

/**
 * Works out when, and from which end, every line draws, and when the lines meet at each
 * city. Growth is random, so it tries again if the cities wouldn't come in order.
 */
function planLattice(lines, cities) {
	const graph = latticeGraph(lines, cities);
	let best;
	for (let attempt = 0; attempt < 200; attempt++) {
		const plan = growOnce(graph);
		const inOrder = plan.meets.every((t, i) => i === 0 || t - plan.meets[i - 1] >= ORDER_GAP);
		if (inOrder) return plan;
		best ??= plan;
	}
	return best;
}

function latticeGraph(lines, cities) {
	const ends = lines.map((line) => ({
		line,
		from: line.dataset.from,
		to: line.dataset.to,
		x1: +line.getAttribute('x1'),
		y1: +line.getAttribute('y1'),
		x2: +line.getAttribute('x2'),
		y2: +line.getAttribute('y2'),
	}));

	const linesAt = new Map(); // node id → lines touching it
	const nodeAt = new Map(); // node id → [x, y]
	for (const edge of ends) {
		for (const [node, x, y] of [[edge.from, edge.x1, edge.y1], [edge.to, edge.x2, edge.y2]]) {
			if (!linesAt.has(node)) linesAt.set(node, []);
			linesAt.get(node).push(edge);
			nodeAt.set(node, [x, y]);
		}
	}

	const pins = cities.map((city) => ({
		x: +city.dataset.x,
		y: +city.dataset.y,
		node: city.dataset.node,
		cross: city.dataset.cross?.split(' ').map(Number),
	}));

	// How much faster a line draws: quick near a city, normal far from one.
	for (const edge of ends) {
		const mx = (edge.x1 + edge.x2) / 2;
		const my = (edge.y1 + edge.y2) / 2;
		const d = Math.min(...pins.map((p) => Math.hypot(p.x - mx, p.y - my)));
		const t = gsap.utils.clamp(0, 1, (d - NEAR.within) / (NEAR.until - NEAR.within));
		edge.pace = NEAR.fast + (1 - NEAR.fast) * t;
	}

	// Each city's cluster starts right beside its intersection, so the lines reach it soon.
	// A cell centre: both diagonals start from their corners at once and cross in the middle.
	// A corner: a single node one line away, picked at random each time.
	const seeds = pins.map((p) => {
		if (p.cross) return [p.cross.map((i) => ends[i].from)];
		return linesAt.get(p.node).map((edge) => [edge.from === p.node ? edge.to : edge.from]);
	});

	return { ends, linesAt, pins, seeds };
}

function growOnce({ ends, linesAt, pins, seeds }) {
	const timing = new Map(); // edge → { start, duration, forwards }
	const reached = new Map(); // node id → time the lattice arrived there
	const queue = []; // [time, node] waiting to send out lines

	const arrive = (node, time) => {
		if (reached.has(node) && reached.get(node) <= time) return;
		reached.set(node, time);
		queue.push([time, node]);
	};

	seeds.forEach((options, i) => {
		for (const node of pickFrom(options)) arrive(node, CITY_SEEDS.first + i * CITY_SEEDS.every);
	});
	for (let i = 0; i < EXTRA_SEEDS.count; i++) arrive(pickFrom([...linesAt.keys()]), between([EXTRA_SEEDS.from, EXTRA_SEEDS.to]));

	let clock = 0;
	while (timing.size < ends.length) {
		if (!queue.length) {
			// An island the clusters can't reach (the Outer Banks): start it fresh.
			const unused = ends.filter((edge) => !timing.has(edge));
			arrive(pickFrom(unused).from, clock + between(PAUSE));
			continue;
		}
		queue.sort((a, b) => a[0] - b[0]);
		const [time, node] = queue.shift();
		clock = time;

		for (const edge of linesAt.get(node)) {
			if (timing.has(edge)) continue;
			const start = time + between(PAUSE) * edge.pace;
			const duration = between(DRAW) * edge.pace;
			const forwards = edge.from === node;
			timing.set(edge, { start, duration, forwards });
			arrive(forwards ? edge.to : edge.from, start + duration);
		}
	}

	// When the lines meet at each city: at a cell centre, when the second diagonal passes
	// through its middle (the ease is symmetric); at a corner, when a second line has visibly
	// reached it (a line leaving the corner counts once a fifth of it is drawn).
	const meets = pins.map((pin) => {
		if (pin.cross) {
			return Math.max(...pin.cross.map((i) => timing.get(ends[i])).map(({ start, duration }) => start + duration / 2));
		}
		const touches = linesAt.get(pin.node).map((edge) => {
			const { start, duration, forwards } = timing.get(edge);
			const leavesHere = (edge.from === pin.node) === forwards;
			return leavesHere ? start + duration * 0.2 : start + duration;
		});
		return touches.sort((a, b) => a - b)[1] ?? touches[0];
	});

	return { lines: ends.map((edge) => ({ line: edge.line, ...timing.get(edge) })), meets };
}
