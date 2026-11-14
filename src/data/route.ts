import { eastCoast, project } from './east-coast';

/**
 * The route map (src/components/RouteMap.astro): places I've done web work, on site and
 * remotely, in the order the route visits them. Each label first names the city, then steps
 * through the `moments` that happened there, then, as the route moves on, lands on `role`.
 * The first stop is the furthest west, and every label lines up on a vertical axis through it.
 */
export interface Stop {
	name: string;
	role: string;
	/** What happened there, shown in order between the city and the role */
	moments: string[];
	lat: number;
	lon: number;
}

export const stops: Stop[] = [
	{ name: 'Athens, GA', moments: ['First web job, University of Georgia'], role: 'Interactive Web Development', lat: 33.9519, lon: -83.3576 },
	{ name: 'Cary, NC', moments: ['Started a family', 'Joined N.C. State'], role: 'Motion & Scroll Animation', lat: 35.7915, lon: -78.7811 },
	{ name: 'Richmond, VA', moments: ['First corporate gig, Ironworks'], role: 'Accessible, Fast Front-End', lat: 37.5407, lon: -77.436 },
	{ name: 'Washington, DC', moments: ['ICF acquires Ironworks'], role: 'AI-Augmented Front-End Development', lat: 38.9072, lon: -77.0369 },
];

/**
 * Which map the poster shows: the route up the east coast, or North Carolina with the
 * four disciplines pinned to its cities.
 */
export const posterMap: 'route' | 'north-carolina' = 'route';

/**
 * The map's shape, for laying out the poster around it (set as CSS variables on the copy):
 * its height as a share of its width; Athens' position across, as a share of its width; the
 * highest and lowest stops' positions down, as shares of its height; and how far right of
 * Athens the map has to stay on screen (just past the furthest stop), as a share of its width.
 */
export const routeGeometry = (() => {
	const [, , width, height] = eastCoast.viewBox.split(' ').map(Number);
	const points = stops.map((stop) => project(stop.lat, stop.lon));
	return {
		ratio: height / width,
		start: points[0].x / width,
		topStop: Math.min(...points.map((p) => p.y)) / height,
		bottomStop: Math.max(...points.map((p) => p.y)) / height,
		reach: (Math.max(...points.map((p) => p.x)) - points[0].x) / width + 0.03,
	};
})();
