// Babel runtime doesn't polyfill prototype functions
import 'babel-runtime/node_modules/core-js/es6/array';

// adapted from:
// TinyColor v1.1.2
// https://github.com/bgrins/TinyColor
// Brian Grinstead, MIT License

// `hsvToRgb`
// Converts an HSV color value to RGB.
// *Assumes:* h,s,v are contained in [0, 1]
// *Returns:* { r, g, b } in the set [0, 255]
function hsvToRgb(h, s, v) {
	h *= 6;

	let i = Math.floor(h),
		f = h - i,
		p = v * (1 - s),
		q = v * (1 - f * s),
		t = v * (1 - (1 - f) * s),
		mod = i % 6,
		r = Math.round([v, q, p, p, t, v][mod] * 255),
		g = Math.round([t, v, v, q, p, p][mod] * 255),
		b = Math.round([p, p, t, v, v, q][mod] * 255);

	return { r, g, b };
}

function rgbToString({ r, g, b }) {
	return `rgb(${r}, ${g}, ${b})`;
}

export function randomGradient({ hue, sat, val, colorStops = 2, angle = Math.floor(Math.random() * 360) + 'deg' } = {}) {
	const colors = new Array(colorStops).fill(0).map(() => {
		const [h = Math.random(), s = Math.random(), v = Math.random()] = [hue, sat, val];
		return rgbToString(hsvToRgb(h, s, v));
	});
	return `linear-gradient(${[angle, ...colors].join(',')})`;
}
