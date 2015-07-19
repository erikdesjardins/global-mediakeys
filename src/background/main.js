(function() {
	Messages.addListener(Const.msg.REGISTER, function(data, tabId) {
		return TabMgr.add(tabId);
	});

	Messages.addListener(Const.msg.UNREGISTER, function(data, tabId) {
		TabMgr.remove(tabId);
	});

	Messages.addListener(Const.msg.PLAY_STATE, function(data, tabId) {
		return TabMgr.update(tabId, 'isPlaying', data);
	});

	function playPause() {
		return TabMgr.first(function(tabId) {
			return Messages.send(Const.msg.PLAY_PAUSE, tabId)
				.catch(TabMgr.remove);
		});
	}
	Commands.addListener(Const.cmd.PLAY_PAUSE, playPause);
	Messages.addListener(Const.msg.PLAY_PAUSE, playPause);

	function next() {
		return TabMgr.first(function(tabId) {
			return Messages.send(Const.msg.NEXT, tabId)
				.catch(TabMgr.remove);
		});
	}
	Commands.addListener(Const.cmd.NEXT, next);
	Messages.addListener(Const.msg.NEXT, next);

	function prev() {
		return TabMgr.first(function(tabId) {
			return Messages.send(Const.msg.PREV, tabId)
				.catch(TabMgr.remove);
		});
	}
	Commands.addListener(Const.cmd.PREV, prev);
	Messages.addListener(Const.msg.PREV, prev);

	function stop() {
		return TabMgr.each(function(tabId, tab) {
			if (tab.isPlaying) {
				// Avoid promoting the tab when its state changes
				tab.isPlaying = false;
				return Messages.send(Const.msg.PLAY_PAUSE, tabId)
					.catch(TabMgr.remove);
			} else {
				return Promise.resolve();
			}
		});
	}
	Commands.addListener(Const.cmd.STOP, stop);

	Messages.addListener(Const.msg.INFO, function() {
		return TabMgr.first(function(tabId, tab) {
			return Messages.send(Const.msg.INFO, tabId)
				.then(function(info) {
					info.isPlaying = tab.isPlaying;
					return info;
				});
		});
	});

	// Prune unresponsive tabs (in case of crashing, etc.)
	TabMgr.each(function(tabId) {
		Messages.send(Const.msg.ECHO, tabId)
			.catch(TabMgr.remove);
	});
})();
