/**
 * @file Utility functions related to arrays.
 * @module util/array
 */

/**
 * <tt>Array.prototype.map</tt> but mapped to <tt>Promise</tt> results.
 * @template T, V
 * @param {T[]} array
 * @param {function(T, number, T[]): (V|Promise<V>)} callback
 * @returns {Promise<V[], *>} Rejects if any promises returned by the callback reject,
 * resolves with a new mapped array otherwise.
 */
export async function asyncMap(array, callback) {
	return await Promise.all(array.map((val, i) => callback(val, i, array)));
}
