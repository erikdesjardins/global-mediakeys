/**
 * @file Utility functions related to objects.
 * @module util/object
 */

/**
 * `_.each` but only for objects.
 * @param {!Object} object
 * @param {function(*, string, !Object): void} callback
 * @returns {void}
 */
export function each(object, callback) {
	for (const key in object) {
		if (object.hasOwnProperty(key)) {
			callback(object[key], key, object);
		}
	}
}

/**
 * Creates a map from `object`.
 * @param {!Object} object
 * @returns {Map} A map containing `object`'s own properties.
 */
export function toMap(object) {
	function* ownPropertyKeyValuePairs(obj) {
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				yield [key, object[key]];
			}
		}
	}
	return new Map(ownPropertyKeyValuePairs(object));
}
