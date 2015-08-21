/**
 * @file A haphazard collection of utility functions.
 * @module util
 */

/* global chrome */

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
 * <tt>_.each</tt>
 * @param {!Object} object
 * @param {function(*, string, !Object)} callback
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
 * <tt>Array.prototype.map</tt> except mapped to <tt>Promise</tt> results.
 * @template T
 * @param {T[]} array
 * @param {function(T, number, T[])} callback Each return value will be casted to <tt>Promise</tt>.
 * @returns {Promise<T[], *>} Rejects if any promises returned by the callback reject,
 * resolves with a new mapped array otherwise.
 */
export async function asyncMap(array, callback) {
	return await Promise.all(array.map((val, i) => callback(val, i, array)));
}

/**
 * Wraps an asynchronous API call in a <tt>Promise</tt>.
 * @param {function(...*, function(...*): void): void} func
 * @returns {function(...*): Promise<void|*|*[], Error>} <tt>func</tt>, in a wrapper that will append a callback to the argument list and return a <tt>Promise</tt>.
 * The <tt>Promise</tt> will reject if <tt>chrome.runtime.lastError</tt> is set,
 * resolving with the result passed to the callback or an array of results otherwise.
 */
export function apiToPromise(func) {
	return (...args) =>
		new Promise((resolve, reject) =>
				func(...args, (...results) => {
					if (chrome.runtime.lastError) {
						reject(new Error(chrome.runtime.lastError));
					} else {
						resolve(results.length > 1 ? results : results[0]);
					}
				})
		);
}

/**
 * Check if <tt>val</tt> is a reference type.
 * @param {*} val
 * @returns {boolean} Whether <tt>val</tt> is a reference type.
 */
export function isRefType(val) {
	return Object(val) === val;
}

/**
 * Check if <tt>val</tt> is a <tt>Promise</tt>-like object.
 * @param {*} val
 * @returns {boolean} Whether <tt>val.then</tt> is a function.
 */
export function isPromise(val) {
	return !!val && (typeof val === 'object' || typeof val === 'function') && typeof val.then === 'function';
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

/**
 * @param {*} obj Cast to <tt>Object</tt>, allowing <tt>typeCheck(true, Boolean)</tt>.
 * @param {!Function} type
 * @throws {TypeError} If <tt>obj</tt> is not an instance of <tt>type</tt>.
 * @returns {void}
 */
export function typeCheck(obj, type) {
	if (!(Object(obj) instanceof type)) {
		throw new TypeError(`${obj} is not an instance of ${type.name}.`);
	}
}

/**
 * <tt>$.fn.click</tt>
 * @param {!EventTarget} ele
 * @returns {void}
 */
export function click(ele) {
	typeCheck(ele, EventTarget);

	ele.dispatchEvent(new MouseEvent('click', {
		view: window,
		bubbles: true,
		cancelable: true
	}));
}

/**
 * <tt>$.fn.empty</tt>
 * @param {!Node} ele
 * @returns {void}
 */
export function empty(ele) {
	typeCheck(ele, Node);

	while (ele.lastChild) {
		ele.removeChild(ele.lastChild);
	}
}

/**
 * Shorthand for setting up a <tt>MutationObserver</tt> on <tt>ele</tt>.
 * @param {!Node} ele
 * @param {!Object} options Should be a <tt>MutationObserverInit</tt>.
 * @param {function(MutationRecord, number, MutationRecord[]): *} callback Invoked for each <tt>MutationRecord</tt>.
 * Return a truthy value to stop handling mutations from this batch.
 * @returns {MutationObserver} The attached observer.
 */
export function observe(ele, options, callback) {
	typeCheck(ele, Node);

	const observer = new MutationObserver(mutations => mutations.some(callback));
	observer.observe(ele, options);
	return observer;
}

/**
 * Similar to {@link observe}, except <tt>callback</tt> is invoked with <tt>ele</tt>.
 * @param {!Node} ele
 * @param {!Object} options Should be a <tt>MutationObserverInit</tt>.
 * @param {function(!Node): void} callback Invoked once per batch of mutations.
 * @param {boolean} [initialCallback=false] Whether the <tt>callback</tt> should be immediately invoked.
 * @returns {MutationObserver} The attached observer.
 */
export function onMutation(ele, options, callback, { initialCallback = false } = {}) {
	typeCheck(ele, Node);

	if (initialCallback) {
		callback(ele);
	}
	return observe(ele, options, () => {
		callback(ele);
		return true;
	});
}

/**
 * Similar to {@link onMutation}, except the observed element is a descendant of <tt>ele</tt>.
 * This descendant may be added or removed from the DOM at any time, and the observer will be reattached.
 * Specifically, the first descendant of <tt>ele</tt> matching <tt>selector</tt> will be observed.
 * @param {!Element} ele
 * @param {string} selector
 * @param {!Object} options Should be a <tt>MutationObserverInit</tt>.
 * @param {function(!Node): void} callback Invoked once per batch of mutations.
 * @param {boolean} [initialCallback=false] Whether the <tt>callback</tt> should be immediately invoked when the descendant is found or replaced.
 * @returns {Promise<void, TypeError>} Rejects if <tt>ele</tt> is the incorrect type,
 * resolves when a matching descendant is found otherwise.
 */
export async function onDescendantMutation(ele, selector, options, callback, { initialCallback = false } = {}) {
	let child = await descendant(ele, selector);
	let observer = onMutation(child, options, callback, { initialCallback });

	function _refreshObserver(e) {
		observer.disconnect();
		child = e;
		observer = onMutation(child, options, callback, { initialCallback });
	}

	observe(ele, { childList: true, subtree: true }, mutation => {
		if (Array.from(mutation.addedNodes).some(node => node.nodeType === Node.ELEMENT_NODE)) {
			const e = ele.querySelector(selector);
			if (e && e !== child) {
				_refreshObserver(e);
			}
			return true;
		}
	});
}

/**
 * Waits for a mutation to occur (optionally filtered by a callback).
 * @param {!Node} ele
 * @param {!Object} options Should be a <tt>MutationObserverInit</tt>.
 * @param {function(MutationRecord): *} [callback] Invoked for each <tt>MutationRecord</tt>.
 * Return a falsy value to filter out the mutation.
 * @returns {Promise<void, TypeError>} Rejects if <tt>ele</tt> is the incorrect type,
 * resolves when an unfiltered mutation occurs otherwise.
 */
export function waitForMutation(ele, options, callback) {
	return new Promise(resolve => {
		const observer = observe(ele, options, mutation => {
			if (!callback || callback(mutation)) {
				observer.disconnect();
				resolve();
				return true;
			}
		});
	});
}

/**
 * Waits for a direct child of <tt>ele</tt> matching <tt>selector</tt>.
 * Does not retrieve the matching element, use {@link descendant} instead.
 * This is due to <tt>MutationRecord</tt> nodes not being live in some situations.
 * @param {!Element} ele
 * @param {string} selector
 * @param {boolean} [initialCheck=true] Whether <tt>ele</tt>'s preexisting children should be checked for a match.
 * @returns {Promise<void, TypeError>} Rejects if <tt>ele</tt> is the incorrect type,
 * resolves when a matching child appears otherwise.
 */
export function waitForChild(ele, selector, { initialCheck = true } = {}) {
	return new Promise(resolve => {
		typeCheck(ele, Element);

		if (initialCheck && Array.from(ele.children).some(child => child.matches(selector))) {
			resolve();
			return;
		}

		const observer = observe(ele, { childList: true }, mutation => {
			if (Array.from(mutation.addedNodes).some(node => node.nodeType === Node.ELEMENT_NODE && node.matches(selector))) {
				observer.disconnect();
				resolve();
				return true;
			}
		});
	});
}

/**
 * Waits for <tt>event</tt> to occur on <tt>ele</tt>.
 * @param {!EventTarget} ele
 * @param {string} event
 * @returns {Promise<void, TypeError>} Rejects if <tt>ele</tt> is the incorrect type,
 * resolves when the <tt>event</tt> occurs otherwise.
 */
export function waitForEvent(ele, event) {
	return new Promise(resolve => {
		typeCheck(ele, EventTarget);

		ele.addEventListener(event, function fire() {
			ele.removeEventListener(event, fire);
			resolve();
		});
	});
}

/**
 * Selects a descendant of <tt>ele</tt> that may not yet exist.
 * Equivalent to <tt>querySelector</tt> when a matching element exists.
 * @param {!Element} ele
 * @param {string} selector
 * @returns {Promise<Element, TypeError>} Rejects if <tt>ele</tt> is the incorrect type,
 * resolves with the selected element otherwise.
 */
export function descendant(ele, selector) {
	return new Promise(resolve => {
		typeCheck(ele, Element);

		const child = ele.querySelector(selector);
		if (child) {
			resolve(child);
			return;
		}

		const observer = observe(ele, { childList: true, subtree: true }, mutation => {
			if (Array.from(mutation.addedNodes).some(node => node.nodeType === Node.ELEMENT_NODE)) {
				const child = ele.querySelector(selector);
				if (child) {
					observer.disconnect();
					resolve(child);
				}
				return true;
			}
		});
	});
}
