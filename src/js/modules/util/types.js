/**
 * @file Utility functions related to types.
 * @module util/types
 */

/**
 * Compares two values.
 * If they are objects, compares their enumerable properties recursively.
 * @param {*} a
 * @param {*} b
 * @returns {boolean} Whether <tt>a</tt> and <tt>b</tt> are equivalent.
 */
export function equals(a, b) {
	if (a instanceof Object && b instanceof Object) {
		const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
		return Array.from(keys.values()).every(k => equals(a[k], b[k]));
	}
	return a === b;
}

/**
 * Check if <tt>val</tt> is a reference type.
 * @param {*} val
 * @returns {boolean} Whether <tt>val</tt> is a reference type.
 */
export function isRefType(val) {
	return Object(val) === val;
}

/**
 * @param {*} obj Cast to <tt>Object</tt>, allowing <tt>typeCheck(true, Boolean)</tt>.
 * @param {!Function} type
 * @throws {TypeError} If <tt>obj</tt> is not an instance of <tt>type</tt>.
 * @returns {void}
 */
export function typeCheck(obj, type) {
	if (!(Object(obj) instanceof type)) {
		throw new TypeError(`${obj} is not an instance of ${type.name}.`);
	}
}
