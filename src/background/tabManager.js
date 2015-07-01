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
		tabs.unshift(Util.obj.extend({}, data, { id: tabId }));
	}

	function _remove(tabs, tabId) {
		return tabs.splice(_validIndex(tabs, tabId), 1)[0];
	}

	function _promote(tabs, tabId) {
		tabs.unshift(_remove(tabs, tabId));
	}

	function add(tabId, data) {
		return isReady.then(function(tabs) {
			if (typeof data !== 'object') {
				console.error('Cannot register tab without data. Arguments:', arguments);
			} else {
				if (_exists(tabs, tabId)) {
					_remove(tabs, tabId);
					console.warn('Tab:', tabId, 'was not unregistered, will be overwritten.');
				}
				_add(tabs, tabId, data);
				console.info('Registered tab:', tabId, 'with data:', data);
			}
		});
	}

	function remove(tabId) {
		return isReady.then(function(tabs) {
			if (!_exists(tabs, tabId)) {
				console.error('Cannot unregister tab:', tabId, 'because it is not registered.');
			} else {
				_remove(tabs, tabId);
				console.info('Unregistered tab:', tabId);
			}
		});
	}

	function updatePlayState(tabId, state) {
		return isReady.then(function(tabs) {
			if (typeof state !== 'boolean') {
				console.error('Cannot set play state to non-boolean value:', state);
			} else if (!_exists(tabs, tabId)) {
				console.error('Cannot update play state of unregistered tab:', tabId);
			} else {
				var tab = _get(tabs, tabId);
				if (tab.isPlaying !== state) {
					tab.isPlaying = state;
					_promote(tabs, tabId);
					console.log('Updated play state of tab:', tabId, 'to:', state);
				}
			}
		});
	}

	function first(callback) {
		return isReady.then(function(tabs) {
			if (!tabs[0]) {
				console.warn('There are no registered tabs.');
			} else {
				return callback(tabs[0].id, tabs[0]);
			}
		});
	}

	function each(callback) {
		return isReady.then(function(tabs) {
			tabs.forEach(function(tab) {
				callback(tab.id, tab);
			});
		});
	}

	exports.add = add;
	exports.remove = remove;
	exports.updatePlayState = updatePlayState;
	exports.first = first;
	exports.each = each;
})(/* jshint -W020 */ TabMgr = {});
