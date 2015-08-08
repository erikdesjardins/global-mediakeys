export function extend(target, ...objects) {
	objects.forEach(extendObj => {
		for (let prop in extendObj) {
			if (extendObj.hasOwnProperty(prop)) {
				target[prop] = extendObj[prop];
			}
		}
	});
	return target;
}

export function each(object, callback) {
	for (let key in object) {
		if (object.hasOwnProperty(key)) {
			callback(object[key], key, object);
		}
	}
}

export async function asyncMap(arr, callback) {
	await Promise.all(arr.map((val, i) => (async () =>
		(arr[i] = await callback(val, i, arr))
	)()));
	return arr;
}

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

export function isRefType(val) {
	return Object(val) === val;
}

export function isPromise(val) {
	return val && (typeof val === 'object' || typeof val === 'function') && typeof val.then === 'function';
}

export function debounce(callback, delay) {
	let timeout;

	function exec(...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => callback(...args), delay);
	}

	exec.cancel = () => clearTimeout(timeout);
	return exec;
}

export function click(ele) {
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

export function empty(ele) {
	if (!ele) {
		throw new TypeError('ele is undefined.');
	}
	while (ele.lastChild) {
		ele.removeChild(ele.lastChild);
	}
}

export function observe(ele, options, callback) {
	if (!ele) {
		throw new TypeError('ele is undefined.');
	}
	const observer = new MutationObserver(mutations => mutations.some(callback));
	observer.observe(ele, options);
	return observer;
}

export function onMutation(ele, options, callback, { initialCallback } = {}) {
	if (initialCallback) {
		callback(ele);
	}
	return observe(ele, options, () => {
		callback(ele);
		return true;
	});
}

export async function onDescendantMutation(ele, selector, options, callback, { initialCallback } = {}) {
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

export function waitForChild(ele, selector, { initialCheck = true } = {}) {
	if (!ele) {
		throw new TypeError('ele is undefined.');
	}
	if (initialCheck) {
		for (let child of Array.from(ele.children)) {
			if (child.matches(selector)) {
				return Promise.resolve();
			}
		}
	}
	return new Promise(resolve => {
		const observer = observe(ele, { childList: true }, mutation =>
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

export function waitForEvent(ele, event) {
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

export function descendant(ele, selector) {
	if (!ele) {
		throw new TypeError('ele is undefined.');
	}
	const child = ele.querySelector(selector);
	if (child) {
		return Promise.resolve(child);
	}
	return new Promise(resolve => {
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
