/**
 * @file Utility functions related to the DOM.
 * @module util/dom
 */

import { typeCheck } from './types';

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
