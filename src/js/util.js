(function(exports) {
	function extend(target, ...objects) {
		objects.forEach(function(extendObj) {
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
		var observer = new MutationObserver(mutations => mutations.forEach(callback));
		observer.observe(ele, options);
		return observer;
	}

	function waitForMutation(ele, options, callback) {
		return new Promise(function(resolve) {
			var observer = observe(ele, options, mutation => {
				if (!callback || callback(mutation)) {
					observer.disconnect();
					resolve();
				}
			});
		});
	}

	function waitForChild(ele, callback) {
		return waitForMutation(ele, { childList: true }, mutation =>
				Array.from(mutation.addedNodes).some(node => !callback || callback(node))
		);
	}

	function waitForEvent(ele, event) {
		return new Promise(function(resolve) {
			ele.addEventListener(event, function fire() {
				ele.removeEventListener(event, fire);
				resolve();
			});
		})
	}

	exports.extend = extend;
	exports.each = each;
	exports.asyncMap = asyncMap;
	exports.isRefType = isRefType;
	exports.isPromise = isPromise;
	exports.debounce = debounce;
	exports.click = click;
	exports.empty = empty;
	exports.observe = observe;
	exports.waitForMutation = waitForMutation;
	exports.waitForChild = waitForChild;
	exports.waitForEvent = waitForEvent;
})(window.Util = {});
