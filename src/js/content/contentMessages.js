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

	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		const { type, data } = request;

		if (!(type in listeners)) {
			console.error('Unrecognised message type:', request, sender);
		} else {
			const response = listeners[type](data);

			if (Util.isPromise(response)) {
				response.then(data => sendResponse({ data }), e => sendResponse());
				return true;
			} else {
				sendResponse({ data: response });
			}
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
