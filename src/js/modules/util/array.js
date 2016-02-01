/**
 * @file Utility functions related to arrays.
 * @module util/array
 */

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
	for (let i = 1; i < array.length; i++) {
		result.push(element, array[i]);
	}
	return result;
}
