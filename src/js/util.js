var Util = (() => {
	function extend(target, ...objects) {
		objects.forEach(extendObj => {
			for (var prop in extendObj) {
				if (extendObj.hasOwnProperty(prop)) {
					target[prop] = extendObj[prop];
				}
			}
		});
		return target;
	}

	function each(object, callback) {
		for (var key in object) {
			if (object.hasOwnProperty(key)) {
				callback(object[key], key, object);
			}
		}
	}

	async function asyncMap(object, callback) {
		await Promise.all(Object.getOwnPropertyNames(object).map(key => (async () =>
			(object[key] = await callback(object[key], key, object))
		)()));
		return object;
	}

	function apiToPromise(func) {
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

	function isRefType(val) {
		return Object(val) === val;
	}

	function isPromise(val) {
		return val && (typeof val === 'object' || typeof val === 'function') && typeof val.then === 'function';
	}

	function debounce(callback, delay) {
		var timeout;

		function exec(...args) {
			clearTimeout(timeout);
			timeout = setTimeout(() => callback(...args), delay);
		}

		exec.cancel = () => clearTimeout(timeout);
		return exec;
	}

	function click(ele) {
		if (!ele) {
			console.warn('Util.click: ele is undefined.');
		} else if (!ele.dispatchEvent) {
			console.error('Cannot dispatch event on element:', ele);
		} else {
			ele.dispatchEvent(new MouseEvent('click', {
				view: window,
				bubbles: true,
				cancelable: true
			}));
		}
	}

	function empty(ele) {
		if (!ele) {
			throw new TypeError('ele is undefined.');
		}
		while (ele.lastChild) {
			ele.removeChild(ele.lastChild);
		}
	}

	function observe(ele, options, callback) {
		if (!ele) {
			throw new TypeError('ele is undefined.');
		}
		var observer = new MutationObserver(mutations => mutations.some(callback));
		observer.observe(ele, options);
		return observer;
	}

	function onMutation(ele, options, callback, { initialCallback } = {}) {
		if (initialCallback) {
			callback(ele);
		}
		return observe(ele, options, () => {
			callback(ele);
			return true;
		});
	}

	async function onDescendantMutation(ele, selector, options, callback, { initialCallback } = {}) {
		var child = await descendant(ele, selector);
		var observer = onMutation(child, options, callback, { initialCallback });

		function _refreshObserver(e) {
			observer.disconnect();
			child = e;
			observer = onMutation(child, options, callback, { initialCallback });
		}

		observe(ele, { childList: true, subtree: true }, mutation => {
			if (Array.from(mutation.addedNodes).some(node => node.nodeType === Node.ELEMENT_NODE)) {
				var e = ele.querySelector(selector);
				if (e && e !== child) {
					_refreshObserver(e);
				}
				return true;
			}
		});
	}

	function waitForMutation(ele, options, callback) {
		return new Promise(resolve => {
			var observer = observe(ele, options, mutation => {
				if (!callback || callback(mutation)) {
					observer.disconnect();
					resolve();
					return true;
				}
			});
		});
	}

	function waitForChild(ele, selector, { initialCheck = true } = {}) {
		if (!ele) {
			throw new TypeError('ele is undefined.');
		}
		if (initialCheck) {
			for (var child of Array.from(ele.children)) {
				if (child.matches(selector)) {
					return Promise.resolve();
				}
			}
		}
		return new Promise(resolve => {
			var observer = observe(ele, { childList: true }, mutation =>
					Array.from(mutation.addedNodes).some(node => {
						if (node.nodeType === Node.ELEMENT_NODE && node.matches(selector)) {
							observer.disconnect();
							resolve();
							return true;
						}
					})
			)
		});
	}

	function waitForEvent(ele, event) {
		if (!ele) {
			throw new TypeError('ele is undefined.');
		}
		return new Promise(resolve => {
			ele.addEventListener(event, function fire() {
				ele.removeEventListener(event, fire);
				resolve();
			});
		})
	}

	function descendant(ele, selector) {
		if (!ele) {
			throw new TypeError('ele is undefined.');
		}
		var child = ele.querySelector(selector);
		if (child) {
			return Promise.resolve(child);
		}
		return new Promise(resolve => {
			var observer = observe(ele, { childList: true, subtree: true }, mutation => {
				if (Array.from(mutation.addedNodes).some(node => node.nodeType === Node.ELEMENT_NODE)) {
					var child = ele.querySelector(selector);
					if (child) {
						observer.disconnect();
						resolve(child);
					}
					return true;
				}
			});
		});
	}

	return {
		extend,
		each,
		asyncMap,
		apiToPromise,
		isRefType,
		isPromise,
		debounce,
		click,
		empty,
		observe,
		onMutation,
		onDescendantMutation,
		waitForMutation,
		waitForChild,
		waitForEvent,
		descendant
	};
})();
