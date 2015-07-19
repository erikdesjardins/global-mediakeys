(function(exports) {
	var isReady = Storage.getWithAutosave(Const.storage.TABS, []);

	function _findIndex(tabs, tabId) {
		return tabs.findIndex(function(tab) {
			return tab.id === tabId;
		});
	}

	function _validIndex(tabs, tabId) {
		var index = _findIndex(tabs, tabId);
		if (index === -1) {
			throw new Error('Tab: ' + tabId + ' not found.');
		} else {
			return index;
		}
	}

	function _exists(tabs, tabId) {
		return _findIndex(tabs, tabId) !== -1;
	}

	function _get(tabs, tabId) {
		return tabs[_validIndex(tabs, tabId)];
	}

	function _add(tabs, tabId, data) {
		tabs.unshift({ id: tabId, data: data });
	}

	function _remove(tabs, tabId) {
		return tabs.splice(_validIndex(tabs, tabId), 1)[0];
	}

	function _promote(tabs, tabId) {
		tabs.unshift(_remove(tabs, tabId));
	}

	function add(tabId) {
		return isReady.then(function(tabs) {
			if (_exists(tabs, tabId)) {
				_remove(tabs, tabId);
				console.warn('Tab:', tabId, 'was not unregistered, will be overwritten.');
			}
			_add(tabs, tabId, {});
			console.info('Registered tab:', tabId);
		});
	}

	function remove(tabId) {
		return isReady.then(function(tabs) {
			if (!_exists(tabs, tabId)) {
				console.error('Cannot unregister non-extant tab:', tabId);
			} else {
				_remove(tabs, tabId);
				console.info('Unregistered tab:', tabId);
			}
		});
	}

	function update(tabId, key, value) {
		return isReady.then(function(tabs) {
			if (!_exists(tabs, tabId)) {
				console.error('Cannot update unregistered tab:', tabId);
			} else {
				var tab = _get(tabs, tabId);
				if (tab.data[key] !== value) {
					tab.data[key] = value;
					_promote(tabs, tabId);
					console.log('Updated tab:', tabId, 'with:', key, '=', value);
				}
			}
		});
	}

	function first(callback) {
		return new Promise(function(resolve, reject) {
			isReady.then(function(tabs) {
				if (!tabs[0]) {
					console.warn('There are no registered tabs.');
					reject();
				} else {
					callback(tabs[0].id, tabs[0].data)
						.then(resolve, reject);
				}
			});
		});
	}

	function each(callback) {
		return new Promise(function(resolve, reject) {
			isReady.then(function(tabs) {
				Promise.all(tabs.map(function(tab) {
					return callback(tab.id, tab.data);
				})).then(resolve, reject);
			});
		});
	}

	exports.add = add;
	exports.remove = remove;
	exports.update = update;
	exports.first = first;
	exports.each = each;
})(window.TabMgr = {});
