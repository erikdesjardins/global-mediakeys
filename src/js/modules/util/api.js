/**
 * @file Utility functions related to the Chrome extension API.
 * @module util/api
 */

import _ from 'lodash';

export const isDevMode = _.once(() => !('update_url' in chrome.runtime.getManifest()));

/**
 * Wraps an asynchronous API call in a promise.
 * @param {function(...*, function(...*): void): void} func
 * @returns {function(...*): Promise<void|*|*[], Error>} `func`, in a wrapper that will append a callback to the argument list and return a promise.
 * The promise will reject if `chrome.runtime.lastError` is set,
 * resolving with the result passed to the callback or an array of results otherwise.
 */
export function apiToPromise(func) {
	return (...args) =>
		new Promise((resolve, reject) =>
			func(...args, (...results) => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError.message));
				} else {
					resolve(results.length > 1 ? results : results[0]);
				}
			})
		);
}
