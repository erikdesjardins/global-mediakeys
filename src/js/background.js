/* global chrome */
import * as Const from './modules/constants';
import { apiToPromise } from './modules/util';
import * as Messages from './modules/background/messages';
import * as Commands from './modules/background/commands';
import * as TabMgr from './modules/background/tabmanager';

function getTabSender(messageType) {
	return async (data) => {
		const { tabId } = await TabMgr.first();
		try {
			return await Messages.send(messageType, tabId, data);
		} catch (e) {
			await TabMgr.remove(tabId);
		}
	};
}

function updateOrFetch(messageType, key) {
	Messages.addListener(messageType, async (data, tabId) => {
		if (tabId) { // From tab, update stored data
			await TabMgr.update(tabId, key, data);
		} else { // From popup, respond with stored data
			const { tab } = await TabMgr.first();
			return tab[key];
		}
	});
}

function forwardToTab(messageType) {
	Messages.addListener(messageType, getTabSender(messageType));
}

function commandToTab(commandType, messageType) {
	Commands.addListener(commandType, getTabSender(messageType));
}

Messages.addListener(Const.msg.REGISTER, (data, tabId) => TabMgr.add(tabId));
// Synchronous to ensure response is sent before unload
Messages.addListener(Const.msg.UNREGISTER, (data, tabId) => { TabMgr.remove(tabId); });

Messages.addListener(Const.msg.ECHO, data => data);

updateOrFetch(Const.msg.PLAY_STATE, 'isPlaying');
updateOrFetch(Const.msg.INFO, 'info');
updateOrFetch(Const.msg.ACTIONS, 'actions');

forwardToTab(Const.msg.DO_ACTION);
forwardToTab(Const.msg.PLAY_PAUSE);
forwardToTab(Const.msg.NEXT);
forwardToTab(Const.msg.PREV);

commandToTab(Const.cmd.PLAY_PAUSE, Const.msg.PLAY_PAUSE);
commandToTab(Const.cmd.NEXT, Const.msg.NEXT);
commandToTab(Const.cmd.PREV, Const.msg.PREV);

Commands.addListener(Const.cmd.STOP, () =>
		TabMgr.each(async ({ tabId, tab }) => {
			if (tab.isPlaying) {
				// Avoid promoting the tab when its state changes
				tab.isPlaying = false;
				try {
					await Messages.send(Const.msg.PLAY_PAUSE, tabId);
				} catch (e) {
					await TabMgr.remove(tabId);
				}
			}
		})
);

Messages.addListener(Const.msg.FOCUS_TAB, async () => {
	const { tabId } = await TabMgr.first();
	const { windowId } = await apiToPromise(chrome.tabs.get)(tabId);
	return await Promise.all([
		apiToPromise(chrome.tabs.update)(tabId, { active: true }),
		apiToPromise(chrome.windows.update)(windowId, { focused: true })
	]);
});

// Prune unresponsive tabs (in case of crashing, etc.)
TabMgr.each(({ tabId }) =>
		Messages.send(Const.msg.ECHO, tabId)
			.catch(() => TabMgr.remove(tabId))
);
