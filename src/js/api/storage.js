/**
 * @file A simple promise-based wrapper around `chrome.storage.local`.
 * @module api/storage
 */

/**
 * Wraps `chrome.storage.local.set`.
 * @param {string} key
 * @param {*} value
 * @returns {Promise<void, Error>} Rejects if `chrome.runtime.lastError` is set,
 * resolves when the `value` is set otherwise.
 */
export async function set(key, value) {
	await chrome.storage.local.set({ [key]: value });
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
	const items = await chrome.storage.local.get({ [key]: defaultValue });
	return items[key];
}

/**
 * Wraps `chrome.storage.local.remove`.
 * @param {...string} keys
 * @returns {Promise<void, Error>} Rejects if `chrome.runtime.lastError` is set,
 * resolves when the `keys` have been removed otherwise.
 */
export async function remove(...keys) {
	await chrome.storage.local.remove(keys);
}
