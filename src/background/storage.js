(function(exports) {
	function set(key, value) {
		var obj = {};
		obj[key] = value;
		return new Promise(function(resolve, reject) {
			chrome.storage.local.set(obj, function() {
				if (chrome.runtime.lastError) {
					reject(chrome.runtime.lastError);
				} else {
					resolve();
				}
			});
		});
	}

	function get(key, defaultValue) {
		return new Promise(function(resolve, reject) {
			chrome.storage.local.get(key, function(items) {
				if (chrome.runtime.lastError) {
					reject(chrome.runtime.lastError);
				} else if (items[key] === undefined) {
					resolve(defaultValue);
				} else {
					resolve(items[key]);
				}
			});
		});
	}

	var hasListener = {};
	function getAndSetOnSuspend(key, defaultValue) {
		return get(key, defaultValue)
			.then(function(val) {
				if (!Util.obj.isRefType(val)) {
					console.warn('Key:', key, 'value:', val, 'is not a reference type - changes will not be saved.');
				} else if (hasListener[key]) {
					console.error('Key:', key, 'has been previously fetched with autosave.');
				} else {
					chrome.runtime.onSuspend.addListener(function() {
						set(key, val);
					});
					hasListener[key] = true;
				}
				return val;
			});
	}

	exports.set = set;
	exports.get = get;
	exports.getWithAutosave = getAndSetOnSuspend;
})(window.Storage = {});
