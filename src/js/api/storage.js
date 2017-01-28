/**
 * @file A simple promise-based wrapper around `chrome.storage.local`.
 * @module api/storage
 */

import _ from 'lodash';
import { apiToPromise } from '../util/api';

/**
 * Wraps `chrome.storage.local.set`.
 * @param {string} key
 * @param {*} value
 * @returns {Promise<void, Error>} Rejects if `chrome.runtime.lastError` is set,
 * resolves when the `value` is set otherwise.
 */
export async function set(key, value) {
	const items = { [key]: value };
	await apiToPromise((items, callback) => chrome.storage.local.set(items, callback))(items);
}

/**
 * Wraps `chrome.storage.local.get`.
 * @template T
 * @param {string} key
 * @param {T} defaultValue
 * @returns {Promise<T, Error>} Rejects if `chrome.runtime.lastError` is set,
 * resolves with `defaultValue` if `key` does not exist in storage,
 * resolves with the value fetched from storage otherwise.
 */
export async function get(key, defaultValue) {
	const items = await apiToPromise((keys, callback) => chrome.storage.local.get(keys, callback))({ [key]: defaultValue });
	return items[key];
}

/**
 * Wraps `chrome.storage.local.remove`.
 * @param {...string} keys
 * @returns {Promise<void, Error>} Rejects if `chrome.runtime.lastError` is set,
 * resolves when the `keys` have been removed otherwise.
 */
export async function remove(...keys) {
	await apiToPromise((keys, callback) => chrome.storage.local.remove(keys, callback))(keys);
}

const fetchedKeys = new Set();

/**
 * Fetches a stored reference type with {@link get}, and stores it during `chrome.runtime.onSuspend` with {@link set}.
 * Persistence cannot be guaranteed.
 * @template T
 * @param {string} key
 * @param {T} defaultValue
 * @returns {Promise<T, Error>} Rejects if it has been previously called with the same `key`,
 * rejects if {@link get} would reject if called with the same arguments,
 * rejects if the value resolved from {@link get} is not a reference type,
 * resolves with the value resolved from {@link get} otherwise.
 */
export async function autopersist(key, defaultValue) {
	if (fetchedKeys.has(key)) {
		throw new Error(`Key: ${key}, has been previously fetched with autopersist.`);
	}

	const val = await get(key, defaultValue);

	if (!_.isObjectLike(val)) {
		throw new TypeError(`Key: ${key}, value: ${val}, is not a reference type - changes cannot be persisted.`);
	}

	chrome.runtime.onSuspend.addListener(() => set(key, val));
	fetchedKeys.add(key);

	return val;
}
