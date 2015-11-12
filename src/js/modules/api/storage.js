/**
 * @file A simple promise-based wrapper around <tt>chrome.storage.local</tt>.
 * @module api/storage
 */

import { apiToPromise } from '../util/function';
import { isRefType } from '../util/types';

/**
 * Wraps <tt>chrome.storage.local.set</tt>.
 * @param {string} key
 * @param {*} value
 * @returns {Promise<void, Error>} Rejects if <tt>chrome.runtime.lastError</tt> is set,
 * resolves when the <tt>value</tt> is set otherwise.
 */
export async function set(key, value) {
	const items = { [key]: value };
	await apiToPromise(::chrome.storage.local.set)(items);
}

/**
 * Wraps <tt>chrome.storage.local.get</tt>.
 * @template T
 * @param {string} key
 * @param {T} defaultValue
 * @returns {Promise<T, Error>} Rejects if <tt>chrome.runtime.lastError</tt> is set,
 * resolves with <tt>defaultValue</tt> if <tt>key</tt> does not exist in storage,
 * resolves with the value fetched from storage otherwise.
 */
export async function get(key, defaultValue) {
	const items = await apiToPromise(::chrome.storage.local.get)(key);
	if (!(key in items)) {
		return defaultValue;
	}
	return items[key];
}

/**
 * Wraps <tt>chrome.storage.local.remove</tt>.
 * @param {...string} keys
 * @returns {Promise<void, Error>} Rejects if <tt>chrome.runtime.lastError</tt> is set,
 * resolves when the <tt>keys</tt> have been removed otherwise.
 */
export async function remove(...keys) {
	await apiToPromise(::chrome.storage.local.remove)(keys);
}

const fetchedKeys = new Set();

/**
 * Fetches a stored reference type with {@link get}, and stores it during <tt>chrome.runtime.onSuspend</tt> with {@link set}.
 * Persistence cannot be guaranteed.
 * @template T
 * @param {string} key
 * @param {T} defaultValue
 * @returns {Promise<T, Error>} Rejects if it has been previously called with the same <tt>key</tt>,
 * rejects if {@link get} would reject if called with the same arguments,
 * rejects if the value resolved from {@link get} is not a reference type,
 * resolves with the value resolved from {@link get} otherwise.
 */
export async function autopersist(key, defaultValue) {
	if (fetchedKeys.has(key)) {
		throw new Error(`Key: ${key}, has been previously fetched with autopersist.`);
	}

	const val = await get(key, defaultValue);

	if (!isRefType(val)) {
		throw new TypeError(`Key: ${key}, value: ${val}, is not a reference type - changes cannot be persisted.`);
	}

	chrome.runtime.onSuspend.addListener(() => set(key, val));
	fetchedKeys.add(key);

	return val;
}
