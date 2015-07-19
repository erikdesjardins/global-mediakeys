(function() {
	Messages.addListener(Const.msg.REGISTER, (data, tabId) => TabMgr.add(tabId));

	// Synchronous to ensure response is sent before unload
	Messages.addListener(Const.msg.UNREGISTER, (data, tabId) => { TabMgr.remove(tabId) });

	Messages.addListener(Const.msg.PLAY_STATE, async (data, tabId) => {
		if (tabId) { // From tab
			await TabMgr.update(tabId, 'isPlaying', data)
		} else { // From popup
			var { tab } = await TabMgr.first();
			return tab.isPlaying;
		}
	});

	Messages.addListener(Const.msg.INFO, async (data, tabId) => {
		if (tabId) { // From tab
			await TabMgr.update(tabId, 'info', data);
		} else { // From popup
			var { tab } = await TabMgr.first();
			return tab.info;
		}
	});

	async function playPause() {
		var { tabId } = await TabMgr.first();
		await Messages.send(Const.msg.PLAY_PAUSE, tabId)
			.catch(() => TabMgr.remove(tabId));
	}

	Commands.addListener(Const.cmd.PLAY_PAUSE, playPause);
	Messages.addListener(Const.msg.PLAY_PAUSE, playPause);

	async function next() {
		var { tabId } = await TabMgr.first();
		await Messages.send(Const.msg.NEXT, tabId)
			.catch(() => TabMgr.remove(tabId));
	}

	Commands.addListener(Const.cmd.NEXT, next);
	Messages.addListener(Const.msg.NEXT, next);

	async function prev() {
		var { tabId } = await TabMgr.first();
		await Messages.send(Const.msg.PREV, tabId)
			.catch(() => TabMgr.remove(tabId));
	}

	Commands.addListener(Const.cmd.PREV, prev);
	Messages.addListener(Const.msg.PREV, prev);

	async function stop() {
		await TabMgr.each(async function(tabId, tab) {
			if (tab.isPlaying) {
				// Avoid promoting the tab when its state changes
				tab.isPlaying = false;
				await Messages.send(Const.msg.PLAY_PAUSE, tabId)
					.catch(() => TabMgr.remove(tabId));
			}
		});
	}

	Commands.addListener(Const.cmd.STOP, stop);

	// Prune unresponsive tabs (in case of crashing, etc.)
	TabMgr.each(tabId =>
			Messages.send(Const.msg.ECHO, tabId)
				.catch(() => TabMgr.remove(tabId))
	);
})();
