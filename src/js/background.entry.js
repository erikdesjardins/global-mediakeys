import AdvisorWrapper from './data/AdvisorWrapper';
import AutopersistWrapper from './data/AutopersistWrapper';
import Logger from './util/Logger';
import OrderedMap from './data/OrderedMap';
import * as Commands from './api/commands';
import * as Messages from './api/messages';
import { CMD, MSG, STORAGE } from './shared/constants';
import { apiToPromise } from './util/api';
import { chain } from './data/Wrapper';

const log = new Logger('TabMgr');
const tabs = chain(
	new OrderedMap(),
	new AdvisorWrapper({
		add: ([tabId]) => log.i('Added id:', tabId),
		remove: ([tabId]) => log.i('Removed id:', tabId),
		update: ([tabId, data], updated) => updated && log.d('Updated id:', tabId, 'with:', data),
	}),
	new AutopersistWrapper(STORAGE.TABS)
);

function getTabSender(type) {
	return async data => {
		const { id: tabId } = await tabs.peek();
		try {
			return await Messages.send(type, { tabId, data });
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

Messages.addListener(MSG.REGISTER, (data, tabId) => tabs.add(tabId));
// Synchronous to ensure response is sent before unload
Messages.addListener(MSG.UNREGISTER, (data, tabId) => { tabs.remove(tabId); });

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
	tabs.each(async ({ id: tabId, data: tab }) => {
		if (tab.isPlaying) {
			// Avoid promoting the tab when its state changes
			tab.isPlaying = false;
			try {
				await Messages.send(MSG.PLAY_PAUSE, { tabId });
			} catch (e) {
				await tabs.remove(tabId);
			}
		}
	})
);

Messages.addListener(MSG.FOCUS_TAB, async () => {
	const { id: tabId } = await tabs.peek();
	const { windowId } = await apiToPromise(chrome.tabs.get)(tabId);
	return Promise.all([
		apiToPromise(chrome.tabs.update)(tabId, { active: true }),
		apiToPromise(chrome.windows.update)(windowId, { focused: true }),
	]);
});

// Prune unresponsive tabs (in case of crashing, etc.)
tabs.each(({ id: tabId }) =>
	Messages.send(MSG.ECHO, { tabId })
		.catch(() => tabs.remove(tabId))
);
