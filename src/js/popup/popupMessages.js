/* global chrome */
const Messages = (() => {
	const listeners = {};

	function addListener(messageType, callback) {
		if (messageType in listeners) {
			console.error('Listener for Message:', messageType, 'already exists.');
		} else {
			listeners[messageType] = callback;
		}
	}

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

	function sendMessage(type, data) {
		const message = { type, data };

		return new Promise((resolve, reject) => {
			chrome.runtime.sendMessage(message, response =>
					response ? resolve(response.data) : reject(new Error(`Received empty response from type: ${type}`))
			);
		});
	}

	addListener(Const.msg.ECHO, data => data);

	return {
		addListener,
		send: sendMessage
	};
})();
