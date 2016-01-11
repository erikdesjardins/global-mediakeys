/**
 * @file Utility functions related to arrays.
 * @module util/array
 */

/**
 * `Array.prototype.map` but mapped to promise results.
 * @template T, V
 * @param {T[]} array
 * @param {function(T, number, T[]): (V|Promise<V>)} callback
 * @returns {Promise<V[], *>} Rejects if any promises returned by the callback reject,
 * resolves with a new mapped array otherwise.
 */
export function asyncMap(array, callback) {
	return Promise.all(array.map((val, i) => callback(val, i, array)));
}

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
