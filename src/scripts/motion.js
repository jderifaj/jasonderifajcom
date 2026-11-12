/** Shared checks for whether, and how, to animate. */

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const hasFinePointer = () => window.matchMedia('(pointer: fine)').matches;

/** Where the pointer sits in the viewport, from -0.5 (left/top) to 0.5 (right/bottom). */
export const pointerOffset = (event) => ({
	x: event.clientX / window.innerWidth - 0.5,
	y: event.clientY / window.innerHeight - 0.5,
});
