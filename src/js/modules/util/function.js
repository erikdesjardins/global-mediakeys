/**
 * @file Utility functions related to functions.
 * @module util/function
 */

/**
 * Wraps an asynchronous API call in a promise.
 * @param {function(...*, function(...*): void): void} func
 * @returns {function(...*): Promise<void|*|*[], Error>} <tt>func</tt>, in a wrapper that will append a callback to the argument list and return a promise.
 * The promise will reject if <tt>chrome.runtime.lastError</tt> is set,
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

/**
 * <tt>_.debounce</tt>
 * @template T
 * @param {function(...*): T} callback
 * @param {number} delay
 * @returns {function(...*): T} <tt>callback</tt>, in a wrapper that will debounce repeated calls.
 */
export function debounce(callback, delay) {
	let timeout;

	function exec(...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => callback(...args), delay);
	}

	exec.cancel = () => clearTimeout(timeout);
	return exec;
}

export function noop() {}

// Semi-functional until Chrome has proxies
export function catchAll(...props) {
	const obj = {};
	props.forEach(prop => obj[prop] = noop);
	return obj;
}

// No proxies :(
// export const catchAll = new Proxy(() => catchAll, { get: () => catchAll });
// export const noop = new Proxy(() => {}, { get: () => noop });

/**
 * Creates a wrapper that will invoke <tt>func</tt> only once,
 * returning the same value in all future invocations.
 * @template T
 * @param {function(): T} func
 * @returns {function(): T} Returns the value returned by <tt>func</tt>.
 */
export function once(func) {
	let defined, value;
	return () => {
		if (!defined) {
			value = func();
			defined = true;
		}
		return value;
	};
}
