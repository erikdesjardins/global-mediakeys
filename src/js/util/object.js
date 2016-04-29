/**
 * @file Utility functions related to objects.
 * @module util/object
 */

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
