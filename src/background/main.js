(function() {
	var preferredTab = null;
	var registeredTabs = {
		//42: {
		//	canSkip: true,
		//	isPlaying: false
		//}
	};

	function registerTab(data, tabId) {
		if (typeof data !== 'object') {
			console.error('Cannot register tab without data. Arguments:', data, tabId);
		} else {
			if (tabId in registeredTabs) {
				console.warn('Tab id:', tabId, 'was not unregistered, re-registering with data:', data);
			}
			registeredTabs[tabId] = data;
		}
	}

	function unregisterTab(data, tabId) {
		if (!(tabId in registeredTabs)) {
			throw new Error('Cannot unregister tab id: ' + tabId + ' because it is not registered.');
		} else {
			delete registeredTabs[data];
		}
	}

	Messages.addListener(Const.msg.REGISTER, registerTab);
	Messages.addListener(Const.msg.UNREGISTER, unregisterTab);

	function updatePlayState(data, tabId) {
		if (typeof data !== 'boolean') {
			throw new Error('Cannot set play state to non-boolean value: ' + data);
		} else if (!(tabId in registeredTabs)) {
			throw new Error('Cannot set play state of tab id: ' + tabId + ' because it is not registered.');
		} else {
			registeredTabs[tabId].isPlaying = data;
		}
	}

	Messages.addListener(Const.msg.PLAY_STATE, updatePlayState);

	function handlePlayPause() {
		if (preferredTab && preferredTab in registeredTabs) {
			var messageName = registeredTabs[preferredTab].isPlaying ? Const.msg.PAUSE : Const.msg.PLAY;
			Messages.send(messageName, preferredTab);
		} else {
			preferredTab = null;
			var anyTabsPlaying = Util.some(registeredTabs, function(tab, id) {
				if (tab.isPlaying) {
					preferredTab = id;
					Messages.send(Const.msg.PAUSE, id);
					return true;
				}
			});
			if (!anyTabsPlaying) {
				var firstTab = Util.firstKey(preferredTab);
				preferredTab = firstTab;
				Messages.send(Const.msg.PLAY, firstTab);
			}
		}
	}

	function handleSkip(messageName) {
		if (preferredTab && preferredTab in registeredTabs && registeredTabs[preferredTab].canSkip) {
			Messages.send(messageName, preferredTab);
		} else {
			Util.some(registeredTabs, function(tab, id) {
				if (tab.canSkip) {
					preferredTab = id;
					Messages.send(messageName, id);
					return true;
				}
			});
		}
	}

	var handleNext = handleSkip.bind(this, Const.msg.NEXT);
	var handlePrev = handleSkip.bind(this, Const.msg.PREV);

	function handleStop() {
		Util.each(registeredTabs, function(tab, id) {
			if (tab.isPlaying) {
				Messages.send(Const.msg.PAUSE, id);
			}
		});
	}

	Commands.addListener(Const.cmd.PLAY_PAUSE, handlePlayPause);
	Commands.addListener(Const.cmd.NEXT, handleNext);
	Commands.addListener(Const.cmd.PREV, handlePrev);
	Commands.addListener(Const.cmd.STOP, handleStop);
})();
