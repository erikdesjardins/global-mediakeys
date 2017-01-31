/**
 * @file Utility functions related to the DOM.
 * @module util/dom
 */

/**
 * `$.fn.empty`
 * @param {!Node} ele
 * @returns {void}
 */
export function empty(ele) {
	while (ele.lastChild) {
		ele.removeChild(ele.lastChild);
	}
}

/**
 * Shorthand for setting up a `MutationObserver` on `ele`.
 * @param {!Node} ele
 * @param {!Object} options Should be a `MutationObserverInit`.
 * @param {function(MutationRecord, number, MutationRecord[]): *} callback Invoked for each `MutationRecord`.
 * Return a truthy value to stop handling mutations from this batch.
 * @returns {MutationObserver} The attached observer.
 */
export function observe(ele, options, callback) {
	const observer = new MutationObserver(mutations => mutations.some(callback));
	observer.observe(ele, options);
	return observer;
}

/*
 * Similar to {@link observe}, except `callback` is invoked with `ele`.
 * @param {!Node} ele
 * @param {!Object} options Should be a `MutationObserverInit`.
 * @param {function(!Node): void} callback Invoked once per batch of mutations.
 * @param {boolean} [initialCallback=false] Whether the `callback` should be immediately invoked.
 * @returns {MutationObserver} The attached observer.
 */
export function onMutation(ele, options, callback, { initialCallback = false } = {}) {
	if (initialCallback) {
		callback(ele);
	}
	return observe(ele, options, () => {
		callback(ele);
		return true;
	});
}

/**
 * @typedef {Object} DescendantMutationUtil
 * @property {function(): void} disconnect Disconnects the observer.
 * @property {function(): !Element} descendant Returns the current descendant.
 * The returned node may not be present in the DOM.
 */

/*
 * Similar to {@link onMutation}, except the observed element is a descendant of `ele`.
 * This descendant may be added or removed from the DOM at any time, and the observer will be reattached.
 * Specifically, the first descendant of `ele` matching `selector` will be observed.
 * @param {!Element|Document} ele
 * @param {string} selector
 * @param {!Object} options Should be a `MutationObserverInit`.
 * @param {function(!Element): void} callback Invoked with the descendant once per batch of mutations.
 * @param {boolean} [initialCallback=false] Whether the `callback` should be immediately invoked when the descendant is found or replaced.
 * @returns {Promise<DescendantMutationUtil, TypeError>} Rejects if `ele` is the incorrect type,
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

	const outerObserver = observe(ele, { childList: true, subtree: true }, mutation => {
		if (Array.from(mutation.addedNodes).some(node => node.nodeType === Node.ELEMENT_NODE)) {
			const e = ele.querySelector(selector);
			if (e && e !== child) {
				_refreshObserver(e);
			}
			return true;
		}
	});

	return {
		disconnect() {
			outerObserver.disconnect();
			observer.disconnect();
		},
		descendant() {
			return child;
		},
	};
}

/**
 * Waits for a mutation to occur (optionally filtered by a callback).
 * @param {!Node} ele
 * @param {!Object} options Should be a `MutationObserverInit`.
 * @param {function(MutationRecord): *} [callback] Invoked for each `MutationRecord`.
 * Return a falsy value to filter out the mutation.
 * @returns {Promise<void, TypeError>} Rejects if `ele` is the incorrect type,
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

/*
 * Waits for a direct child of `ele` matching `selector`.
 * Does not retrieve the matching element, use {@link descendant} instead.
 * This is due to `MutationRecord` nodes not being live in some situations.
 * @param {!Element|Document} ele
 * @param {string} selector
 * @param {boolean} [initialCheck=true] Whether `ele`'s preexisting children should be checked for a match.
 * @returns {Promise<void, TypeError>} Rejects if `ele` is the incorrect type,
 * resolves when a matching child appears otherwise.
 */
export function waitForChild(ele, selector, { initialCheck = true } = {}) {
	return new Promise(resolve => {
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
 * Waits for `event` to occur on `ele`.
 * @param {!EventTarget} ele
 * @param {string} event
 * @returns {Promise<void, TypeError>} Rejects if `ele` is the incorrect type,
 * resolves when the `event` occurs otherwise.
 */
export function waitForEvent(ele, event) {
	return new Promise(resolve => {
		ele.addEventListener(event, function fire() {
			ele.removeEventListener(event, fire);
			resolve();
		});
	});
}

/**
 * Selects a descendant of `ele` that may not yet exist.
 * Equivalent to `querySelector` when a matching element exists.
 * @param {!Element|Document} ele
 * @param {string} selector
 * @returns {Promise<Element, TypeError>} Rejects if `ele` is the incorrect type,
 * resolves with the selected element otherwise.
 */
export function descendant(ele, selector) {
	return new Promise(resolve => {
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
