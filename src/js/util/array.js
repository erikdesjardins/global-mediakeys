/**
 * @file Utility functions related to arrays.
 * @module util/array
 */

import { range } from './generator';

/**
 * Essentially, `Array.prototype.join` without converting to `string`.
 * @template T
 * @param {T[]} array
 * @param {*} element
 * @returns {T[]} `array` with `element` inserted between each element.
 */
export function intersperse(array, element) {
	if (!array.length) {
		return [];
	}

	const result = [array[0]];
	for (const i of range(1, array.length)) {
		result.push(element, array[i]);
	}
	return result;
}
