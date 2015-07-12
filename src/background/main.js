(function() {'use strict';
	Messages.addListener(Const.msg.REGISTER, function(data, tabId) {
		TabMgr.add(tabId, data);
	});

	Messages.addListener(Const.msg.UNREGISTER, function(data, tabId) {
		TabMgr.remove(tabId);
	});

	Messages.addListener(Const.msg.PLAY_STATE, function(data, tabId) {
		TabMgr.updatePlayState(tabId, data);
	});

	function removeTab(tabId) {
		return function() {
			TabMgr.remove(tabId);
		};
	}

	Commands.addListener(Const.cmd.PLAY_PAUSE, function() {
		TabMgr.first(function(tabId, tab) {
			var messageName = tab.isPlaying ? Const.msg.PAUSE : Const.msg.PLAY;
			Messages.send(messageName, tabId)
				.catch(removeTab(tabId));
		});
	});

	Commands.addListener(Const.cmd.NEXT, function() {
		TabMgr.first(function(tabId) {
			Messages.send(Const.msg.NEXT, tabId)
				.catch(removeTab(tabId));
		});
	});

	Commands.addListener(Const.cmd.PREV, function() {
		TabMgr.first(function(tabId) {
			Messages.send(Const.msg.PREV, tabId)
				.catch(removeTab(tabId));
		});
	});

	Commands.addListener(Const.cmd.STOP, function() {
		TabMgr.each(function(tabId, tab) {
			if (tab.isPlaying) {
				Messages.send(Const.msg.PAUSE, tabId)
					.catch(removeTab(tabId));
			}
		});
	});
})();
