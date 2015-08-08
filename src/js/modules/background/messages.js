/* global chrome */
import { isPromise } from '../util';

const listeners = {};

export function addListener(messageType, callback) {
	if (messageType in listeners) {
		console.error('Listener for Message:', messageType, 'already exists.');
	} else {
		listeners[messageType] = callback;
	}
}

function sendMessage(type, tabId, data) {
	const message = { type, data };
	const target = parseInt(tabId, 10);

	return new Promise((resolve, reject) => {
		chrome.tabs.sendMessage(target, message, response =>
				response ? resolve(response.data) : reject(new Error(`Received empty response from type: ${type}`))
		);
	});
}

export { sendMessage as send };

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	const { type, data } = request;
	const tabId = sender.tab && sender.tab.id;

	if (!(type in listeners)) {
		console.error('Unrecognised message type:', request, sender);
	} else {
		const response = listeners[type](data, tabId);

		if (isPromise(response)) {
			response.then(data => sendResponse({ data }), e => sendResponse());
			return true;
		} else {
			sendResponse({ data: response });
		}
	}
});
