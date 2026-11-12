import gsap from 'gsap';

/**
 * Brings North Carolina in once the rest of the page has settled: the outline and fill
 * fade up, then the lattice draws itself.
 *
 * The lattice grows like frost. A few lines start at random nodes; whenever a line
 * finishes, the lines leaving its far end start after a random pause. The clusters
 * spread, meet and merge until every line is drawn. Each line is slow and faint, so
 * the movement stays in the background.
 */

const SEEDS = 4;
const SEED_WINDOW = 6; // seconds over which the first lines appear
const PAUSE = [0.4, 2.6]; // wait at a node before a line leaves it
const DRAW = [2.2, 4]; // how long one line takes to draw

const between = ([min, max]) => min + Math.random() * (max - min);
const pickFrom = (items) => items[Math.floor(Math.random() * items.length)];

export function drawState() {
	const outline = document.querySelector('.state-line');
	const fill = document.querySelector('.state-fill');
	const lines = [...document.querySelectorAll('.state-truss line')];
	if (!outline) return;

	gsap.timeline()
		.to([outline, fill], { opacity: 1, duration: 1.8, ease: 'sine.inOut' })
		.add(() => growLattice(lines), '+=0.4');
}

/** Works out when, and from which end, each line draws, then hands it to GSAP. */
function growLattice(lines) {
	const linesAt = new Map(); // node id → lines touching it
	for (const line of lines) {
		for (const node of [line.dataset.from, line.dataset.to]) {
			if (!linesAt.has(node)) linesAt.set(node, []);
			linesAt.get(node).push(line);
		}
	}

	const scheduled = new Set();
	const reached = new Map(); // node id → time the lattice arrived there
	const queue = []; // [time, node] waiting to send out lines

	const arrive = (node, time) => {
		if (reached.has(node) && reached.get(node) <= time) return;
		reached.set(node, time);
		queue.push([time, node]);
	};

	const startCluster = (time) => {
		const unused = lines.filter((line) => !scheduled.has(line));
		if (unused.length) arrive(pickFrom(unused).dataset.from, time);
	};

	for (let i = 0; i < SEEDS; i++) startCluster(between([0, SEED_WINDOW]));

	let clock = 0;
	while (scheduled.size < lines.length) {
		if (!queue.length) {
			// An island the clusters can't reach (the Outer Banks): start it fresh.
			startCluster(clock + between(PAUSE));
			continue;
		}
		queue.sort((a, b) => a[0] - b[0]);
		const [time, node] = queue.shift();
		clock = time;

		for (const line of linesAt.get(node)) {
			if (scheduled.has(line)) continue;
			scheduled.add(line);

			const start = time + between(PAUSE);
			const duration = between(DRAW);
			const forwards = line.dataset.from === node;
			const far = forwards ? line.dataset.to : line.dataset.from;

			// pathLength is 1: an offset of 1 hides the line; -1 hides it from the other end.
			// autoRound is off because GSAP would otherwise round these tiny values to whole pixels.
			gsap.fromTo(
				line,
				{ strokeDashoffset: forwards ? 1 : -1 },
				{ strokeDashoffset: 0, duration, delay: start, ease: 'sine.inOut', autoRound: false },
			);
			arrive(far, start + duration);
		}
	}
}
