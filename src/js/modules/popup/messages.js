/* global chrome */
const listeners = {};

export function addListener(messageType, callback) {
	if (messageType in listeners) {
		throw new Error(`Listener for message type: ${messageType} already exists.`);
	}
	listeners[messageType] = callback;
}

function sendMessage(type, data) {
	const message = { type, data };

	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(message, response =>
				response ? resolve(response.data) : reject(new Error(`Received empty response from message type: ${type}`))
		);
	});
}

export { sendMessage as send };

chrome.runtime.onMessage.addListener((request, sender) => {
	const { type, data } = request;
	const tabId = sender.tab && sender.tab.id;

	if (!(type in listeners)) {
		console.error('Unrecognised message type:', request, sender);
	} else {
		listeners[type](data, tabId);
		// Responses handled by the background page
	}
});
