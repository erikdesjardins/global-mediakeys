/* global chrome */
import * as Const from './base/constants';
import * as Messages from './modules/api/messages';
import * as Commands from './modules/api/commands';
import { apiToPromise } from './modules/util/function';
import OrderedMap from './modules/data/OrderedMap';
import AutopersistWrapper from './modules/data/AutopersistWrapper';

const tabs = new AutopersistWrapper(new OrderedMap('TabMgr'), Const.storage.TABS);

function getTabSender(type) {
	return async (data) => {
		const { id: tabId } = await tabs.peek();
		try {
			return await Messages.send({ type, tabId, data });
		} catch (e) {
			await tabs.remove(tabId);
		}
	};
}

function updateOrFetch(messageType, key) {
	Messages.addListener(messageType, async (data, tabId) => {
		if (tabId) { // From tab, update stored data
			await tabs.update(tabId, { [key]: data });
		} else { // From popup, respond with stored data
			const { data: tab } = await tabs.peek();
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

Messages.addListener(Const.msg.REGISTER, (data, tabId) => tabs.add(tabId));
// Synchronous to ensure response is sent before unload
Messages.addListener(Const.msg.UNREGISTER, (data, tabId) => { tabs.remove(tabId); });

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
		tabs.each(async ({ id: tabId, data: tab }) => {
			if (tab.isPlaying) {
				// Avoid promoting the tab when its state changes
				tab.isPlaying = false;
				try {
					await Messages.send({ type: Const.msg.PLAY_PAUSE, tabId });
				} catch (e) {
					await tabs.remove(tabId);
				}
			}
		})
);

Messages.addListener(Const.msg.FOCUS_TAB, async () => {
	const { id: tabId } = await tabs.peek();
	const { windowId } = await apiToPromise(chrome.tabs.get)(tabId);
	return await Promise.all([
		apiToPromise(chrome.tabs.update)(tabId, { active: true }),
		apiToPromise(chrome.windows.update)(windowId, { focused: true })
	]);
});

// Prune unresponsive tabs (in case of crashing, etc.)
tabs.each(({ id: tabId }) =>
		Messages.send({ type: Const.msg.ECHO, tabId })
			.catch(() => tabs.remove(tabId))
);
