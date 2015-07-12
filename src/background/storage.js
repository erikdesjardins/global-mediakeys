(function(exports) {'use strict';
	function set(key, value) {
		var obj = {};
		obj[key] = value;
		return new Promise(function(resolve) {
			chrome.storage.local.set(obj, resolve);
		});
	}

	function get(key, defaultValue) {
		return new Promise(function(resolve) {
			chrome.storage.local.get(key, function(items) {
				if (typeof items[key] === 'undefined') {
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
})(/* jshint -W020 */ Storage = {});
