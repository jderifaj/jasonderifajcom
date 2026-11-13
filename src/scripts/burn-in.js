import gsap from 'gsap';
import { prefersReducedMotion } from './motion.js';

/**
 * Words: each quote's key phrase types out beside the quote's number (01, 02...) in monospace,
 * turns into the body font, slides from there onto its place in the quote, flares there for a
 * moment, then dissolves into the text, which keeps a mint tint.
 *
 * The phrases play in order, one after another, and each one waits until its quote is on
 * screen: an IntersectionObserver on the panel's scroll watches for them, so the rest play as
 * the reader scrolls down. Closing the panel resets it, so the next visit plays again. With
 * reduced motion, the phrases are tinted from the start.
 */

const OPEN_DELAY = 0.9; // seconds, so the panel's own entrance (src/scripts/panels.js) finishes first
const GAP = 0.25; // seconds between one phrase settling and the next appearing
const SLIDE = 1.1;
const TYPE_SPEED = 0.035; // seconds per character
const TYPE_MAX = 1.3; // seconds, however long the phrase
const MERGE = 0.45; // seconds for the typewriter text to cross into the body font
const HOLD = 0.5; // seconds the phrase rests beside its number before sliding

export function initBurnIn() {
	const dialog = document.getElementById('recommendations');
	if (!dialog) return;

	const phrases = [...dialog.querySelectorAll('.burn')];
	let session = null;

	new MutationObserver(() => {
		if (dialog.open && !session) session = play();
		else if (!dialog.open && session) {
			session.stop();
			session = null;
		}
	}).observe(dialog, { attributes: true, attributeFilter: ['open'] });

	function play() {
		if (prefersReducedMotion()) {
			for (const phrase of phrases) phrase.classList.add('is-lit');
			return { stop: reset };
		}

		const visible = new Set();
		const pending = [...phrases]; // in reading order
		const animations = [];
		let layer = null;
		let busy = false;

		const head = dialog.querySelector('.panel-head');
		const observer = new IntersectionObserver(
			(entries) => {
				for (const { target, isIntersecting } of entries) {
					if (isIntersecting) visible.add(target);
					else visible.delete(target);
				}
				next();
			},
			{ root: dialog, rootMargin: `-${head.offsetHeight}px 0px -8% 0px`, threshold: 0.9 },
		);

		const start = gsap.delayedCall(OPEN_DELAY, () => {
			for (const phrase of phrases) observer.observe(phrase);
		});

		/** Plays the first phrase still to come that's on screen, once the last one has settled. */
		function next() {
			if (busy) return;
			const phrase = pending.find((p) => visible.has(p));
			if (!phrase) return; // the observer calls again when one scrolls into view
			busy = true;
			pending.splice(pending.indexOf(phrase), 1);
			observer.unobserve(phrase);
			visible.delete(phrase);
			if (!pending.length) observer.disconnect();
			slide(phrase, () => {
				animations.push(gsap.delayedCall(GAP, () => {
					busy = false;
					next();
				}));
			});
		}

		/**
		 * The phrase types out beside the quote's number in the number's monospace, then crosses
		 * into the body font at the same width and slides onto the original. A phrase that wraps
		 * in the quote splits on the way, each line landing on its own.
		 */
		function slide(phrase, done) {
			layer ??= makeLayer();
			const item = phrase.closest('li');
			const style = getComputedStyle(phrase.parentElement);
			const box = dialog.getBoundingClientRect();
			const scroll = dialog.scrollTop;

			// One copy per line the phrase occupies, laid over that line
			const lines = linesOf(phrase).map(({ text, rect }) => {
				const flyer = document.createElement('div');
				flyer.className = 'burn-flyer';
				flyer.setAttribute('aria-hidden', 'true');
				flyer.style.cssText = `font:${style.font};letter-spacing:${style.letterSpacing}`;
				const words = document.createElement('span');
				words.textContent = text;
				flyer.append(words);
				layer.append(flyer);

				// Set it over the original, then correct for the line box around the text
				const land = { x: rect.left - box.left, y: rect.top - box.top + scroll };
				gsap.set(flyer, land);
				const placed = words.getBoundingClientRect();
				land.x += rect.left - placed.left;
				land.y += rect.top - placed.top;
				return { flyer, land, width: placed.width, offset: rect.top - placed.top, height: placed.height };
			});

			// The start: the lines end to end, just right of the number (the item's ::before),
			// centred on it and scaled down if needed to stay inside the column
			const number = getComputedStyle(item, '::before');
			const numberSize = parseFloat(number.fontSize);
			const itemBox = item.getBoundingClientRect();
			const numberTop = itemBox.top + parseFloat(getComputedStyle(item).paddingTop);
			const startX = itemBox.left + 2 * (0.6 * numberSize + parseFloat(number.letterSpacing || 0)) + numberSize;
			const room = itemBox.right - startX;
			const middle = numberTop + parseFloat(number.lineHeight) / 2;

			// First it types out in the number's monospace, scaled down if it would leave the column
			const typer = document.createElement('div');
			typer.className = 'burn-typer';
			typer.setAttribute('aria-hidden', 'true');
			typer.style.fontSize = number.fontSize;
			const typed = document.createElement('span');
			typed.textContent = phrase.textContent;
			const cursor = document.createElement('span');
			cursor.className = 'burn-cursor';
			typer.append(typed, cursor);
			layer.append(typer);
			const typerBox = typed.getBoundingClientRect();
			const typerScale = Math.min(1, room / typerBox.width);
			typed.textContent = '';
			gsap.set(typer, {
				x: startX - box.left,
				y: middle - box.top + scroll - (typer.offsetHeight / 2) * typerScale,
				scale: typerScale,
				transformOrigin: '0 0',
			});

			// Then the body font takes over at the same width, the lines end to end
			const space = parseFloat(style.fontSize) * 0.28;
			const total = lines.reduce((sum, line) => sum + line.width, 0) + space * (lines.length - 1);
			const scale = Math.min(room, typerBox.width * typerScale) / total;

			const text = phrase.textContent;
			const typing = Math.min(TYPE_SPEED * text.length, TYPE_MAX);
			const merge = typing + 0.25;
			const counter = { chars: 0 };
			const tl = gsap.timeline({
				onComplete: () => {
					for (const { flyer } of lines) flyer.remove();
					typer.remove();
					done();
				},
			})
				.to(counter, {
					chars: text.length,
					duration: typing,
					ease: 'none',
					onUpdate: () => { typed.textContent = text.slice(0, Math.round(counter.chars)); },
				}, 0)
				.to(typer, { opacity: 0, filter: 'blur(3px)', duration: MERGE, ease: 'power1.inOut' }, merge);

			let along = 0;
			for (const { flyer, land, width, offset, height } of lines) {
				const from = {
					x: startX - box.left + along * scale,
					y: middle - box.top + scroll - (height / 2) * scale + offset * scale,
				};
				along += width + space;
				tl.set(flyer, { ...from, scale, opacity: 0, transformOrigin: '0 0' }, 0)
					.to(flyer, { opacity: 1, duration: MERGE, ease: 'power1.inOut' }, merge)
					.to(flyer, { ...land, scale: 1, duration: SLIDE, ease: 'power3.inOut' }, merge + MERGE + HOLD);
			}
			// Holds bright on its spot for a beat, then dissolves into the quote as the original
			// burns in under it
			tl.add(() => burn(phrase), '+=0.35')
				.to(lines.map((line) => line.flyer), { opacity: 0, filter: 'blur(6px)', duration: 0.8, ease: 'power2.in' }, '<');
			animations.push(tl);
		}

		/** The phrase's text split into the lines it wraps onto, each with its box on screen. */
		function linesOf(phrase) {
			const node = phrase.firstChild;
			const range = document.createRange();
			const lines = [];
			for (let i = 0; i < node.length; i++) {
				range.setStart(node, i);
				range.setEnd(node, i + 1);
				const rect = range.getBoundingClientRect();
				if (!rect.width) continue; // a space at a line break
				const line = lines.at(-1);
				if (line && Math.abs(line.top - rect.top) < rect.height / 2) line.end = i + 1;
				else lines.push({ top: rect.top, start: i, end: i + 1 });
			}
			return lines.map(({ start, end }) => {
				range.setStart(node, start);
				range.setEnd(node, end);
				return { text: node.data.slice(start, end), rect: range.getBoundingClientRect() };
			});
		}

		/** The phrase in the quote flares white with a mint glow and cools to mint. */
		function burn(phrase) {
			const mint = getComputedStyle(dialog).getPropertyValue('--mint').trim();
			const tween = gsap.fromTo(
				phrase,
				{ color: '#fff', textShadow: '0 0 14px rgb(157 247 242 / 0.9)' },
				{
					color: mint,
					textShadow: '0 0 0px rgb(157 247 242 / 0)',
					duration: 1.6,
					ease: 'power2.out',
					onComplete: () => {
						phrase.classList.add('is-lit');
						gsap.set(phrase, { clearProps: 'color,textShadow' });
					},
				},
			);
			animations.push(tween);
		}

		function makeLayer() {
			const el = document.createElement('div');
			el.className = 'burn-layer';
			el.setAttribute('aria-hidden', 'true');
			el.style.height = `${dialog.scrollHeight}px`;
			dialog.append(el);
			return el;
		}

		return {
			stop() {
				start.kill();
				observer.disconnect();
				for (const animation of animations) animation.kill();
				layer?.remove();
				reset();
			},
		};
	}

	function reset() {
		for (const phrase of phrases) {
			phrase.classList.remove('is-lit');
			gsap.set(phrase, { clearProps: 'color,textShadow' });
		}
	}
}
