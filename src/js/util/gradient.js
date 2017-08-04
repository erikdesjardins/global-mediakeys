/**
 * @file A primitive utility for generating random `linear-gradient`s.
 * @module util/gradient
 */

// adapted from:
// TinyColor v1.1.2
// https://github.com/bgrins/TinyColor
// Brian Grinstead, MIT License

// `hsvToRgb`
// Converts an HSV color value to RGB.
// *Assumes:* h,s,v are contained in [0, 1]
// *Returns:* { r, g, b } in the set [0, 255]
function hsvToRgb(_h, s, v) {
	const h = _h * 6;

	const i = Math.floor(h);
	const f = h - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);
	const mod = i % 6;
	const r = Math.round([v, q, p, p, t, v][mod] * 255);
	const g = Math.round([t, v, v, q, p, p][mod] * 255);
	const b = Math.round([p, p, t, v, v, q][mod] * 255);

	return { r, g, b };
}

function rgbToString({ r, g, b }) {
	return `rgb(${r}, ${g}, ${b})`;
}

/*
 * Create a random gradient.
 * The following named parameters may be passed in an object to tune its creation.
 * @param {number} [hue] A number in [0, 1].
 * @param {number} [sat] A number in [0, 1].
 * @param {number} [val] A number in [0, 1].
 * @param {number} [colorStops=2] An integer at least 2.
 * @param {string} [angle] A valid CSS angle.
 * @returns {string} A valid CSS `linear-gradient`.
 */
export function randomGradient({ hue, sat, val, colorStops = 2, angle = `${Math.floor(Math.random() * 360)}deg` } = {}) {
	const colors = new Array(colorStops).fill(0).map(() => {
		const [h = Math.random(), s = Math.random(), v = Math.random()] = [hue, sat, val];
		return rgbToString(hsvToRgb(h, s, v));
	});
	return `linear-gradient(${[angle, ...colors].join(',')})`;
}
