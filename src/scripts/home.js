import { playIntro } from './intro.js';
import { initPanels } from './panels.js';
import { drawState } from './state.js';
import { initWorkPreview } from './work-preview.js';

const intro = playIntro();
initPanels();
initWorkPreview();

// North Carolina comes in last, once the intro has finished and everything has loaded.
if (intro) {
	const introDone = new Promise((resolve) => intro.eventCallback('onComplete', resolve));
	const pageLoaded =
		document.readyState === 'complete'
			? Promise.resolve()
			: new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
	Promise.all([introDone, pageLoaded]).then(drawState);
}
