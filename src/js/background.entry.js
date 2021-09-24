import * as Commands from './api/commands';
import * as Messages from './api/messages';
import * as Tabs from './data/tabs';
import { CMD, MSG } from './shared/constants';

function getTabSender(type) {
	return async data => {
		const { id: tabId } = await Tabs.peek();
		try {
			return await Messages.send(type, { tabId, data });
		} catch (e) {
			await Tabs.remove(tabId);
		}
	};
}

function updateOrFetch(messageType, key) {
	Messages.addListener(messageType, async (data, tabId) => {
		if (tabId) { // From tab, update stored data
			await Tabs.update(tabId, { [key]: data });
		} else { // From popup, respond with stored data
			const { data: tab } = await Tabs.peek();
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

Messages.addListener(MSG.REGISTER, (data, tabId) => Tabs.add(tabId));
// Synchronous to ensure response is sent before unload
Messages.addListener(MSG.UNREGISTER, (data, tabId) => { Tabs.remove(tabId); });

Messages.addListener(MSG.ECHO, data => data);

updateOrFetch(MSG.PLAY_STATE, 'isPlaying');
updateOrFetch(MSG.INFO, 'info');
updateOrFetch(MSG.ACTIONS, 'actions');

forwardToTab(MSG.DO_ACTION);
forwardToTab(MSG.PLAY_PAUSE);
forwardToTab(MSG.NEXT);
forwardToTab(MSG.PREV);

commandToTab(CMD.PLAY_PAUSE, MSG.PLAY_PAUSE);
commandToTab(CMD.NEXT, MSG.NEXT);
commandToTab(CMD.PREV, MSG.PREV);

Commands.addListener(CMD.STOP, () =>
	Tabs.each(async ({ id: tabId, data: tab }) => {
		if (tab.isPlaying) {
			// Avoid promoting the tab when its state changes
			tab.isPlaying = false;
			try {
				await Messages.send(MSG.PLAY_PAUSE, { tabId });
				await Tabs.save(); // save manual update of isPlaying
			} catch (e) {
				await Tabs.remove(tabId);
			}
		}
	}),
);

Messages.addListener(MSG.FOCUS_TAB, async () => {
	const { id: tabId } = await Tabs.peek();
	const { windowId } = await chrome.tabs.get(tabId);
	return Promise.all([
		chrome.tabs.update(tabId, { active: true }),
		chrome.windows.update(windowId, { focused: true }),
	]);
});

// Prune unresponsive tabs (in case of crashing, etc.)
Tabs.each(({ id: tabId }) =>
	Messages.send(MSG.ECHO, { tabId })
		.catch(() => Tabs.remove(tabId)),
);
