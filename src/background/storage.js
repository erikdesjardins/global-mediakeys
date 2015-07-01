(function(exports) {
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

	function getAndSetOnSuspend(key, defaultValue) {
		return get(key, defaultValue)
			.then(function(val) {
				if (!Util.obj.isRefType(val)) {
					console.warn('Key:', key, 'value:', val, 'is not a reference type - changes will not be saved.');
				} else {
					chrome.runtime.onSuspend.addListener(function() {
						set(key, val);
					});
				}
				return val;
			});
	}

	exports.set = set;
	exports.get = get;
	exports.getWithAutosave = getAndSetOnSuspend;
})(/* jshint -W020 */ Storage = {});
