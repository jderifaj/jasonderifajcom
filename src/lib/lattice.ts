/**
 * Builds a truss lattice (square cells with both diagonals) over a shape, as plain
 * line segments so each one can be animated on its own.
 */

type Point = [number, number];

export interface LatticeEdge {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	/** Ids of the two grid nodes the edge joins, for growing the lattice node by node. */
	from: number;
	to: number;
}

interface Options {
	/** SVG path made of straight segments only (M, L and Z), as produced in src/data. */
	path: string;
	width: number;
	height: number;
	cell: number;
	/** Degrees, matching the slight tilt of a hand-placed overprint. */
	rotate: number;
}

/** Splits an M…L…Z path into its rings of points. */
function ringsOf(path: string): Point[][] {
	return path
		.split('M')
		.filter(Boolean)
		.map((ring) =>
			ring
				.replace('Z', '')
				.split('L')
				.map((pair) => pair.trim().split(/\s+/).map(Number) as Point),
		);
}

/** Even-odd point-in-polygon test across all rings. */
function contains(rings: Point[][], [x, y]: Point): boolean {
	let inside = false;
	for (const ring of rings) {
		for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
			const [xi, yi] = ring[i];
			const [xj, yj] = ring[j];
			if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
		}
	}
	return inside;
}

export function buildLattice({ path, width, height, cell, rotate }: Options): LatticeEdge[] {
	const rings = ringsOf(path);
	const angle = (rotate * Math.PI) / 180;
	const [cx, cy] = [width / 2, height / 2];

	// Grid coordinates (i, j) → SVG coordinates, rotated about the centre
	const place = (i: number, j: number): Point => {
		const [u, v] = [i * cell, j * cell];
		return [cx + u * Math.cos(angle) - v * Math.sin(angle), cy + u * Math.sin(angle) + v * Math.cos(angle)];
	};

	const reach = Math.ceil(Math.hypot(width, height) / 2 / cell) + 1;
	const nodeId = (i: number, j: number) => (i + reach) * (2 * reach + 1) + (j + reach);
	const edges: LatticeEdge[] = [];

	const add = (a: [number, number], b: [number, number]) => {
		const p = place(...a);
		const q = place(...b);
		const middle: Point = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
		// Keep edges that touch the state; the clip path trims what spills over the coast.
		if (!contains(rings, middle) && !contains(rings, p) && !contains(rings, q)) return;
		edges.push({
			x1: +p[0].toFixed(1),
			y1: +p[1].toFixed(1),
			x2: +q[0].toFixed(1),
			y2: +q[1].toFixed(1),
			from: nodeId(...a),
			to: nodeId(...b),
		});
	};

	for (let i = -reach; i < reach; i++) {
		for (let j = -reach; j < reach; j++) {
			add([i, j], [i + 1, j]); // top
			add([i, j], [i, j + 1]); // left
			add([i, j], [i + 1, j + 1]); // diagonal
			add([i + 1, j], [i, j + 1]); // the other diagonal
		}
	}
	// Close the far right and bottom sides of the grid
	for (let k = -reach; k < reach; k++) {
		add([reach, k], [reach, k + 1]);
		add([k, reach], [k + 1, reach]);
	}

	return edges;
}

export interface LatticePoint {
	x: number;
	y: number;
	/** A grid corner, where lines meet end to end, by node id… */
	node?: number;
	/** …or the middle of a cell, where its two diagonals cross, by their indexes in the edge list. */
	cross?: [number, number];
}

/**
 * The lattice point nearest (x, y) where lines meet, inside the shape so it's never
 * clipped away: a grid corner, or a cell centre where the two diagonals cross.
 */
export function nearestIntersection(edges: LatticeEdge[], path: string, x: number, y: number): LatticePoint {
	const rings = ringsOf(path);
	const points: LatticePoint[] = [];

	const corners = new Map<number, LatticePoint>();
	for (const { x1, y1, x2, y2, from, to } of edges) {
		corners.set(from, { x: x1, y: y1, node: from });
		corners.set(to, { x: x2, y: y2, node: to });
	}
	points.push(...corners.values());

	// Two edges sharing a midpoint are the diagonals of one cell.
	const byMiddle = new Map<string, number[]>();
	edges.forEach(({ x1, y1, x2, y2 }, index) => {
		const key = `${Math.round(x1 + x2)},${Math.round(y1 + y2)}`;
		byMiddle.set(key, [...(byMiddle.get(key) ?? []), index]);
	});
	for (const pair of byMiddle.values()) {
		if (pair.length !== 2) continue;
		const { x1, y1, x2, y2 } = edges[pair[0]];
		points.push({ x: (x1 + x2) / 2, y: (y1 + y2) / 2, cross: [pair[0], pair[1]] });
	}

	const inside = points.filter((p) => contains(rings, [p.x, p.y]));
	return inside.reduce((best, p) => (Math.hypot(p.x - x, p.y - y) < Math.hypot(best.x - x, best.y - y) ? p : best));
}
