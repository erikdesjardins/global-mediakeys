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

	function waitForChild(ele, selector, { initialCheck } = {}) {
		if (!ele) {
			throw new TypeError('ele is undefined.');
		}
		if (initialCheck !== false) {
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
							return true;
						}
					}
				}
			)
		});
	}

	return {
		extend,
		each,
		asyncMap,
		isRefType,
		isPromise,
		debounce,
		click,
		empty,
		observe,
		waitForMutation,
		waitForChild,
		waitForEvent,
		descendant
	};
})();
