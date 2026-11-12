import { eastCoast, project } from './east-coast';

/**
 * The route map (src/components/RouteMap.astro): places I've done web work, on site and
 * remotely, in the order the route visits them. Each label first names the city, then, as the
 * route moves on, changes to `role`. `side` is which side of the dot the label sits on, and
 * `phoneSide` overrides it on screens 640px wide or less.
 */
type Side = 'left' | 'right';

export interface Stop {
	name: string;
	role: string;
	lat: number;
	lon: number;
	side: Side;
	phoneSide?: Side;
	/** On phones, put the label above its dot instead of beside it. */
	phoneAbove?: boolean;
}

export const stops: Stop[] = [
	// On phones Athens' label sits above its dot, so the URL below can rise up beside it.
	{ name: 'Athens, GA', role: 'Interactive Web Development', lat: 33.9519, lon: -83.3576, side: 'right', phoneAbove: true },
	// On phones the map is narrow, so these labels go left too or they'd run off the screen.
	{ name: 'Cary, NC', role: 'Motion & Scroll Animation', lat: 35.7915, lon: -78.7811, side: 'right', phoneSide: 'left' },
	{ name: 'Richmond, VA', role: 'Accessible, Fast Front-End', lat: 37.5407, lon: -77.436, side: 'right', phoneSide: 'left' },
	// Top right of the route: its label goes left, into the open space, so it stays on screen.
	{ name: 'Washington, DC', role: 'Design Systems & UI Engineering', lat: 38.9072, lon: -77.0369, side: 'left' },
];

/**
 * Which map the poster shows: the route up the east coast, or North Carolina with the
 * four disciplines pinned to its cities.
 */
export const posterMap: 'route' | 'north-carolina' = 'route';

/**
 * The map's shape, for laying out the poster around it (set as CSS variables on the copy):
 * its height as a share of its width, and Athens' and the highest stop's positions as shares
 * of its width and height.
 */
export const routeGeometry = (() => {
	const [, , width, height] = eastCoast.viewBox.split(' ').map(Number);
	const points = stops.map((stop) => project(stop.lat, stop.lon));
	return {
		ratio: height / width,
		start: points[0].x / width,
		topStop: Math.min(...points.map((p) => p.y)) / height,
	};
})();
