/**
 * @file A primitive utility for generating random `linear-gradient`s.
 * @module util/gradient
 */

import tinycolor from 'tinycolor2';

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
		return tinycolor.fromRatio({ h, s, v }).toHexString();
	});
	return `linear-gradient(${[angle, ...colors].join(',')})`;
}
