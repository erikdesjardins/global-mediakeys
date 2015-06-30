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
				console.warn('Tab:', tabId, 'was not unregistered, re-registering with data:', data);
			} else {
				console.info('Registered tab:', tabId, 'with data:', data);
			}
			registeredTabs[tabId] = data;
		}
	}

	function unregisterTab(data, tabId) {
		if (!(tabId in registeredTabs)) {
			console.error('Cannot unregister tab:', tabId, 'because it is not registered.');
		} else {
			delete registeredTabs[tabId];
			console.info('Unregistered tab:', tabId);
		}
	}

	Messages.addListener(Const.msg.REGISTER, registerTab);
	Messages.addListener(Const.msg.UNREGISTER, unregisterTab);

	function updatePlayState(data, tabId) {
		if (typeof data !== 'boolean') {
			console.error('Cannot set play state to non-boolean value:', data);
		} else if (!(tabId in registeredTabs)) {
			console.error('Cannot set play state of tab:', tabId, 'because it is not registered.');
		} else {
			registeredTabs[tabId].isPlaying = data;
			console.log('Updated play state of tab:', tabId, 'to:', data);
		}
	}

	Messages.addListener(Const.msg.PLAY_STATE, updatePlayState);

	function ifAnyTabsRegistered(func) {
		return function() {
			if (!Util.obj.isEmpty(registeredTabs)){
				func.apply(null, arguments);
			} else {
				console.log('Attempted to fire:', func.name, 'but there are no registered tabs.');
			}
		};
	}

	function handlePlayPause() {
		if (preferredTab && preferredTab in registeredTabs) {
			var messageName = registeredTabs[preferredTab].isPlaying ? Const.msg.PAUSE : Const.msg.PLAY;
			Messages.send(messageName, preferredTab);
			console.log('Sending message:', messageName, 'to preferred tab:', preferredTab);
		} else {
			preferredTab = null;
			var anyTabsPlaying = Util.obj.some(registeredTabs, function(tab, id) {
				if (tab.isPlaying) {
					preferredTab = id;
					Messages.send(Const.msg.PAUSE, id);
					console.log('Sending message:', Const.msg.PAUSE, 'to first playing tab:', id);
					return true;
				}
			});
			if (!anyTabsPlaying) {
				var firstTab = Util.obj.firstKey(registeredTabs);
				preferredTab = firstTab;
				Messages.send(Const.msg.PLAY, firstTab);
				console.log('Sending message:', Const.msg.PLAY, 'to first registered tab:', firstTab);
			}
		}
	}

	function handleSkip(messageName) {
		if (preferredTab && preferredTab in registeredTabs && registeredTabs[preferredTab].canSkip) {
			Messages.send(messageName, preferredTab);
			console.log('Sending message:', messageName, 'to preferred tab:', preferredTab);
		} else {
			Util.obj.some(registeredTabs, function(tab, id) {
				if (tab.canSkip) {
					preferredTab = id;
					Messages.send(messageName, id);
					console.log('Sending message:', messageName, 'to first skippable tab:', id);
					return true;
				}
			});
		}
	}

	var handleNext = handleSkip.bind(this, Const.msg.NEXT);
	var handlePrev = handleSkip.bind(this, Const.msg.PREV);

	function handleStop() {
		Util.obj.each(registeredTabs, function(tab, id) {
			if (tab.isPlaying) {
				Messages.send(Const.msg.PAUSE, id);
			}
		});
	}

	Commands.addListener(Const.cmd.PLAY_PAUSE,	ifAnyTabsRegistered(handlePlayPause));
	Commands.addListener(Const.cmd.NEXT,		ifAnyTabsRegistered(handleNext));
	Commands.addListener(Const.cmd.PREV,		ifAnyTabsRegistered(handlePrev));
	Commands.addListener(Const.cmd.STOP,		ifAnyTabsRegistered(handleStop));
})();
