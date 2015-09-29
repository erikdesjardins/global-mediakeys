/**
 * @file Utility functions related to objects.
 * @module util/object
 */

/**
 * <tt>_.extend</tt>
 * @param {!Object} target
 * @param {...!Object} objects
 * @returns {Object} <tt>target</tt> with properties extended from <tt>objects</tt>.
 */
export function extend(target, ...objects) {
	objects.forEach(extendObj => {
		for (const prop in extendObj) {
			if (extendObj.hasOwnProperty(prop)) {
				target[prop] = extendObj[prop];
			}
		}
	});
	return target;
}

/**
 * <tt>_.each</tt> but only for objects.
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
 * Creates a map from <tt>object</tt>.
 * @param {!Object} object
 * @returns {Map} A map containing <tt>object</tt>'s own properties.
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
