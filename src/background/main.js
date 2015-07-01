(function() {
	Messages.addListener(Const.msg.REGISTER, function(data, tabId) {
		return Tabs.add(tabId, data);
	});
	Messages.addListener(Const.msg.UNREGISTER, function(data, tabId) {
		return Tabs.remove(tabId);
	});
	Messages.addListener(Const.msg.PLAY_STATE, function(data, tabId) {
		return Tabs.updatePlayState(tabId, data);
	});

	function onFirstTab(callback) {
		return function() {
			var tab = Tabs.first();
			if (!tab) {
				console.log('Attempted to fire:', callback.name, 'but there are no registered tabs.');
			} else {
				callback(tab);
			}
		};
	}

	function handlePlayPause(tab) {
		var messageName = tab.isPlaying ? Const.msg.PAUSE : Const.msg.PLAY;
		Messages.send(messageName, tab.id);
	}

	function _handleSkip(tab, messageName) {
		if (tab.canSkip) {
			Messages.send(messageName, tab.id);
		} else {
			console.log('Attempted to send:', messageName, 'but tab:', tab.id, 'is not skippable.');
		}
	}

	function handleNext(tab) {
		_handleSkip(tab, Const.msg.NEXT);
	}

	function handlePrev(tab) {
		_handleSkip(tab, Const.msg.PREV);
	}

	function handleStop() {
		Tabs.each(function(tab) {
			if (tab.isPlaying) {
				Messages.send(Const.msg.PAUSE, tab.id);
			}
		});
	}

	Commands.addListener(Const.cmd.PLAY_PAUSE, onFirstTab(handlePlayPause));
	Commands.addListener(Const.cmd.NEXT, onFirstTab(handleNext));
	Commands.addListener(Const.cmd.PREV, onFirstTab(handlePrev));
	Commands.addListener(Const.cmd.STOP, handleStop);
})();
