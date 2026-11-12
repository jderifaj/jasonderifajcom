import { initCaseStudyPulse } from './case-study.js';
import { playIntro } from './intro.js';
import { initPanels } from './panels.js';
import { drawState } from './state.js';
import { initWorkPreview } from './work-preview.js';

const intro = playIntro();
initPanels();
initWorkPreview();
initCaseStudyPulse();

// North Carolina starts drawing once the intro is most of the way in and everything has loaded.
if (intro) {
	const introDone = new Promise((resolve) => intro.call(resolve, undefined, 1.2));
	const pageLoaded =
		document.readyState === 'complete'
			? Promise.resolve()
			: new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
	Promise.all([introDone, pageLoaded]).then(drawState);
}
