(function(exports) {
	var tabs = [
		//{
		//	id: 42,
		//	canSkip: true,
		//	isPlaying: false
		//}
	];

	function _getIndex(tabId) {
		return tabs.findIndex(function(tab) {
			return tab.id === tabId;
		});
	}

	function _getSilent(tabId) {
		return tabs[_getIndex(tabId)];
	}

	function _get(tabId) {
		var index = _getIndex(tabId);
		if (index === -1) {
			throw new Error('Tab: ' + tabId + ' not found.');
		} else {
			// Promote tab to first
			tabs.unshift(tabs.splice(index, 1)[0]);
			return tabs[index];
		}
	}

	function add(tabId, data) {
		if (typeof data !== 'object') {
			console.error('Cannot register tab without data. Arguments:', data, tabId);
		} else {
			if (_getSilent(tabId)) {
				console.warn('Tab:', tabId, 'was not unregistered, force-removing.');
				remove(tabId);
			}
			tabs.unshift({
				id: tabId,
				canSkip: data.canSkip,
				isPlaying: data.isPlaying
			});
			console.info('Registered tab:', tabId, 'with data:', data);
		}
	}

	function remove(tabId) {
		if (!_getSilent(tabId)) {
			console.error('Cannot unregister tab:', tabId, 'because it is not registered.');
		} else {
			tabs.splice(_getIndex(tabId), 1);
			console.info('Unregistered tab:', tabId);
		}
	}

	function updatePlayState(tabId, state) {
		if (typeof state !== 'boolean') {
			console.error('Cannot set play state to non-boolean value:', state);
		} else {
			_get(tabId).isPlaying = state;
			console.log('Updated play state of tab:', tabId, 'to:', state);
		}
	}

	function first() {
		return tabs[0];
	}

	function each(callback) {
		return tabs.forEach(callback);
	}

	exports.add = add;
	exports.remove = remove;
	exports.updatePlayState = updatePlayState;
	exports.first = first;
	exports.each = each;
})(/* jshint -W020 */ Tabs = {});
