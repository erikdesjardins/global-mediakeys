/**
 * @file A simple <tt>Promise</tt>-based wrapper around <tt>chrome.storage.local</tt>.
 * @module background/storage
 */

/* global chrome */
import { isRefType } from '../util';

/**
 * Wraps <tt>chrome.storage.local.set</tt>.
 * @param {string} key
 * @param {*} value
 * @returns {Promise<void, Error>} Rejects if <tt>chrome.runtime.lastError</tt> is set,
 * resolves otherwise.
 */
export function set(key, value) {
	const obj = { [key]: value };
	return new Promise((resolve, reject) => {
		chrome.storage.local.set(obj, () =>
				chrome.runtime.lastError ? reject(new Error(chrome.runtime.lastError)) : resolve()
		);
	});
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
export function get(key, defaultValue) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(key, items => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError));
			} else if (!(key in items)) {
				resolve(defaultValue);
			} else {
				resolve(items[key]);
			}
		});
	});
}

const hasListener = {};

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
	if (hasListener[key]) {
		throw new Error(`Key: ${key}, has been previously fetched with autopersist.`);
	}

	const val = await get(key, defaultValue);

	if (!isRefType(val)) {
		throw new TypeError(`Key: ${key}, value: ${val}, is not a reference type - changes cannot be persisted.`);
	}

	chrome.runtime.onSuspend.addListener(() => set(key, val));
	hasListener[key] = true;

	return val;
}
