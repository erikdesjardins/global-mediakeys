/**
 * @file A map containing entries with unique ids, each holding a key-value map.
 * Keeps a stack of entries with the most recently updated on top.
 * @module data/tabs
 */

import * as Storage from '../api/storage';
import Logger from '../util/Logger';
import { STORAGE } from '../shared/constants';
import { structuralEq } from '../util/object';

const log = new Logger('TabMgr');

/**
 * Information about an entry in the map.
 * @typedef {Object} Entry
 * @property {number} id A copy of the entry's id.
 * @property {!Object} data The key-value map associated with the entry.
 */

/**
 * Current values in the map.
 * @type {Array<Entry>}
 * @private
 */
let _v = null;

const isReady = Storage.get(STORAGE.TABS, []).then(values => {
	_v = values;
});

// These functions can only be called after `isReady` resolves

function _save() {
	return Storage.set(STORAGE.TABS, _v);
}

function _findIndex(id) {
	return _v.findIndex(val => val.id === id);
}

function _validIndex(id) {
	const index = _findIndex(id);
	if (index === -1) {
		throw new Error(`Id: ${id} not found.`);
	}
	return index;
}

function _exists(id) {
	return _findIndex(id) !== -1;
}

function _get(id) {
	return _v[_validIndex(id)];
}

function _add(id, data) {
	_v.push({ id, data });
}

function _remove(id) {
	return _v.splice(_validIndex(id), 1)[0];
}

function _promote(id) {
	_v.push(_remove(id));
}

/**
 * Stores the map to persistent storage.
 * Should be called if and only if properties of objects in the map are mutated manually.
 * @returns {Promise<void>} Completes when saving is done.
 */
export async function save() {
	await isReady;

	await _save();
}

/**
 * Adds a new entry to the map.
 * If an entry with the same `id` exists, it will be overwritten.
 * @param {number} id
 * @param {Object} [data] Each key-value pair in `data` will be copied to the new entry.
 * @returns {Promise<void>} Completes when adding is done.
 */
export async function add(id, data = {}) {
	await isReady;

	if (_exists(id)) {
		_remove(id);
	}
	_add(id, { ...data });
	await _save();
	log.i('Added id:', id);
}

/**
 * Removes an entry from the map.
 * @param {number} id
 * @throws {Error} If no entry with `id` exists.
 * @returns {Promise<void>} Completes when removing is done.
 */
export async function remove(id) {
	await isReady;

	if (!_exists(id)) {
		throw new Error(`Cannot remove non-extant id: ${id}`);
	}
	_remove(id);
	await _save();
	log.i('Removed id:', id);
}

/**
 * Updates the data stored in a specific entry.
 * An update may not be performed if the data would not be changed.
 * @param {number} id
 * @param {!Object} data Each key-value pair in `data` will be copied to the entry.
 * @throws {Error} If no entry with `id` exists.
 * @returns {Promise<boolean>} True if an update was performed, false otherwise.
 */
export async function update(id, data) {
	await isReady;

	if (!_exists(id)) {
		throw new Error(`Cannot update non-extant id: ${id}`);
	}
	const entry = _get(id);
	const newData = { ...entry.data, ...data };
	if (!structuralEq(entry.data, newData)) {
		entry.data = newData;
		_promote(id);
		await _save();
		log.d('Updated id:', id, 'with:', data);
		return true;
	}
	return false;
}

/**
 * Gets the most recently updated entry.
 * @throws {Error} If the map is empty.
 * @returns {Promise<Entry>} The most recently updated entry in the map.
 */
export async function peek() {
	await isReady;

	if (_v.length === 0) {
		throw new Error('The map is empty.');
	}
	const { id, data } = _v[_v.length - 1];
	return { id, data };
}

/**
 * Executes a callback for each entry in the map.
 * Order of execution is not defined.
 * @param {function(Entry): *} callback
 * @returns {Promise<void, *>} Rejects if any of the promises returned by `callback` reject,
 * resolves when all promises resolve otherwise.
 * Return values are cast to `Promise`.
 */
export async function each(callback) {
	await isReady;

	await Promise.all(_v.map(({ id, data }) => callback({ id, data })));
}
