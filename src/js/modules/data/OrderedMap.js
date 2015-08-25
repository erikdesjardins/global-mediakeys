/**
 * @file A map containing entries with unique ids, each holding a key-value map.
 * Keeps a stack of entries with the most recently updated on top.
 * OrderedMap -> 0..* id -> 0..* key -> 0..1 value
 * @module data/OrderedMap
 */

// Babel runtime doesn't polyfill prototype functions
import 'babel-runtime/node_modules/core-js/es6/array';

import { catchAll } from '../util/function';
import { extend } from '../util/object';
import { equals } from '../util/types';
import Logger from '../util/Logger';
import { inject, wrappable } from './Wrapper';

export default
@inject('_v', [])
class OrderedMap {
	/**
	 * @class
	 * @param {string} [tag] Passed to {@link Logger}.
	 * If specified, will log add, remove, and update operations.
	 */
	constructor(tag) {
		this._v = [];
		this._log = tag ? new Logger(tag) : catchAll('w', 'i', 'd');
	}

	_findIndex(id) {
		return this._v.findIndex(val => val.id === id);
	}

	_validIndex(id) {
		const index = this._findIndex(id);
		if (index === -1) {
			throw new Error(`Id: ${id} not found.`);
		}
		return index;
	}

	_exists(id) {
		return this._findIndex(id) !== -1;
	}

	_get(id) {
		return this._v[this._validIndex(id)];
	}

	_add(id, data) {
		this._v.unshift({ id, data });
	}

	_remove(id) {
		return this._v.splice(this._validIndex(id), 1)[0];
	}

	_promote(id) {
		this._v.unshift(this._remove(id));
	}

	/**
	 * Adds a new entry to the map.
	 * If an entry with the same <tt>id</tt> exists, it will be overwritten.
	 * @param {number} id
	 * @param {Object} [data] Each key-value pair in <tt>data</tt> will be copied to the new entry.
	 * @returns {void}
	 */
	@wrappable
	add(id, data = {}) {
		if (this._exists(id)) {
			this._remove(id);
			this._log.w('Id:', id, 'already exists, will be overwritten.');
		}
		this._add(id, extend({}, data));
		this._log.i('Added id:', id, 'with:', data);
	}

	/**
	 * Removes an entry from the map.
	 * @param {number} id
	 * @throws {Error} If no entry with <tt>id</tt> exists.
	 * @returns {void}
	 */
	@wrappable
	remove(id) {
		if (!this._exists(id)) {
			throw new Error(`Cannot remove non-extant id: ${id}`);
		}
		this._remove(id);
		this._log.i('Removed id:', id);
	}

	/**
	 * Updates the data stored in a specific entry.
	 * An update may not be performed if the data would not be changed.
	 * @param {number} id
	 * @param {!Object} data Each key-value pair in <tt>data</tt> will be copied to the entry.
	 * @throws {Error} If no entry with <tt>id</tt> exists.
	 * @returns {void}
	 */
	@wrappable
	update(id, data) {
		if (!this._exists(id)) {
			throw new Error(`Cannot update non-extant id: ${id}`);
		}
		const entry = this._get(id);
		const newData = extend({}, entry.data, data);
		if (!equals(entry.data, newData)) {
			entry.data = newData;
			this._promote(id);
			this._log.d('Updated id:', id, 'with:', data);
		}
	}

	/**
	 * Information about an entry in the map.
	 * @typedef {Object} Entry
	 * @property {string} id A copy of the entry's id.
	 * @property {!Object} data The key-value map associated with the entry.
	 */

	/**
	 * Gets the most recently updated entry.
	 * @throws {Error} If the map is empty.
	 * @returns {Entry} The most recently updated entry in the map.
	 */
	@wrappable
	peek() {
		if (!this._v.length) {
			throw new Error('The map is empty.');
		}
		const [{ id, data }] = this._v;
		return { id, data };
	}

	/**
	 * Executes a callback for each entry in the map.
	 * Order of execution is not defined.
	 * @param {function(Entry): *} callback
	 * @returns {Promise<void, *>} Rejects if any of the promises returned by <tt>callback</tt> reject,
	 * resolves when all promises resolve otherwise.
	 * Return values are cast to <tt>Promise</tt>.
	 */
	@wrappable
	async each(callback) {
		await Promise.all(this._v.map(({ id, data }) => callback({ id, data })));
	}

	*[Symbol.iterator]() {
		for (const { id, data } of this._v) {
			yield { id, data };
		}
	}
}
