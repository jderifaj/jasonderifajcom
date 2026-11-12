import { initCaseStudyPulse } from './case-study.js';
import { playIntro } from './intro.js';
import { initPanels } from './panels.js';
import { drawRoute, measureCopy, sizeRoute } from './route.js';
import { drawState } from './state.js';
import { initWorkPreview } from './work-preview.js';

const intro = playIntro();
initPanels();
initWorkPreview();
initCaseStudyPulse();
measureCopy();
sizeRoute();

// The map starts drawing once the intro is most of the way in and everything has loaded:
// the route up the east coast, or North Carolina (see posterMap in src/data/route.ts).
if (intro) {
	const introDone = new Promise((resolve) => intro.call(resolve, undefined, 1.2));
	const pageLoaded =
		document.readyState === 'complete'
			? Promise.resolve()
			: new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
	const drawMap = document.querySelector('[data-route]') ? drawRoute : drawState;
	Promise.all([introDone, pageLoaded]).then(drawMap);
}
