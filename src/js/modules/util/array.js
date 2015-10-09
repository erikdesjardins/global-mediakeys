/**
 * @file Utility functions related to arrays.
 * @module util/array
 */

/**
 * <tt>Array.prototype.map</tt> but mapped to promise results.
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
 * Essentially, <tt>Array.prototype.join</tt> without converting to <tt>string</tt>.
 * @template T
 * @param {T[]} array
 * @param {*} element
 * @returns {T[]} <tt>array</tt> with <tt>element</tt> inserted between each element.
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
