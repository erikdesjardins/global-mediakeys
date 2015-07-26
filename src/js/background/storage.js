/* global chrome */
var Storage = (function() {
	function set(key, value) {
		var obj = {};
		obj[key] = value;
		return new Promise(function(resolve, reject) {
			chrome.storage.local.set(obj, () =>
					chrome.runtime.lastError ? reject(new Error(chrome.runtime.lastError)) : resolve()
			);
		});
	}

	function get(key, defaultValue) {
		return new Promise(function(resolve, reject) {
			chrome.storage.local.get(key, function(items) {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError));
				} else if (items[key] === undefined) {
					resolve(defaultValue);
				} else {
					resolve(items[key]);
				}
			});
		});
	}

	var hasListener = {};

	async function getAndSetOnSuspend(key, defaultValue) {
		var val = await get(key, defaultValue);
		if (!Util.isRefType(val)) {
			console.warn('Key:', key, 'value:', val, 'is not a reference type - changes will not be saved.');
		} else if (hasListener[key]) {
			console.error('Key:', key, 'has been previously fetched with autosave.');
		} else {
			chrome.runtime.onSuspend.addListener(() => set(key, val));
			hasListener[key] = true;
		}
		return val;
	}

	return {
		set,
		get,
		getWithAutosave: getAndSetOnSuspend
	};
})();
