// adapted from:
// TinyColor v1.1.2
// https://github.com/bgrins/TinyColor
// Brian Grinstead, MIT License

var Gradient = (() => {
	// `hsvToRgb`
	// Converts an HSV color value to RGB.
	// *Assumes:* h,s,v are contained in [0, 1]
	// *Returns:* { r, g, b } in the set [0, 255]
	function hsvToRgb(h, s, v) {
		h *= 6;

		var i = Math.floor(h),
			f = h - i,
			p = v * (1 - s),
			q = v * (1 - f * s),
			t = v * (1 - (1 - f) * s),
			mod = i % 6,
			r = [v, q, p, p, t, v][mod] * 255,
			g = [t, v, v, q, p, p][mod] * 255,
			b = [p, p, t, v, v, q][mod] * 255;

		return { r, g, b };
	}

	function toHexPair(decimal) {
		return ('00' + decimal.toString(16)).slice(-2);
	}

	function rgbToString({ r, g, b }) {
		return '#' + toHexPair(r) + toHexPair(g) + toHexPair(b);
	}

	function createRandom(hue = 0.8, sat = 0.25, colorStops = 2, angle = Math.floor(Math.random() * 360) + 'deg') {
		var colors = new Array(colorStops).fill(0)
			.map(() => rgbToString(hsvToRgb(hue, sat, Math.random())));
		return `linear-gradient(${[angle, ...colors].join(',')})`;
	}

	return {
		createRandom
	};
})();
