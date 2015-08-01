(() => {
	function updateOrFetch(messageType, key) {
		Messages.addListener(messageType, async (data, tabId) => {
			if (tabId) { // From tab
				await TabMgr.update(tabId, key, data);
			} else { // From popup
				var { tab } = await TabMgr.first();
				return tab[key];
			}
		});
	}

	function forwardToTab(messageType) {
		Messages.addListener(messageType, async (data) => {
			var { tabId } = await TabMgr.first();
			return await Messages.send(messageType, tabId, data);
		});
	}

	function getTabSender(messageType) {
		return async () => {
			var { tabId } = await TabMgr.first();
			await Messages.send(messageType, tabId)
				.catch(() => TabMgr.remove(tabId));
		}
	}

	Messages.addListener(Const.msg.REGISTER, (data, tabId) => TabMgr.add(tabId));
	// Synchronous to ensure response is sent before unload
	Messages.addListener(Const.msg.UNREGISTER, (data, tabId) => { TabMgr.remove(tabId) });

	updateOrFetch(Const.msg.PLAY_STATE, 'isPlaying');
	updateOrFetch(Const.msg.INFO, 'info');
	updateOrFetch(Const.msg.ACTIONS, 'actions');

	forwardToTab(Const.msg.DO_ACTION);

	var playPause = getTabSender(Const.msg.PLAY_PAUSE);
	Commands.addListener(Const.cmd.PLAY_PAUSE, playPause);
	Messages.addListener(Const.msg.PLAY_PAUSE, playPause);

	var next = getTabSender(Const.msg.NEXT);
	Commands.addListener(Const.cmd.NEXT, next);
	Messages.addListener(Const.msg.NEXT, next);

	var prev = getTabSender(Const.msg.PREV);
	Commands.addListener(Const.cmd.PREV, prev);
	Messages.addListener(Const.msg.PREV, prev);

	async function stop() {
		await TabMgr.each(async ({ tabId, tab }) => {
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
