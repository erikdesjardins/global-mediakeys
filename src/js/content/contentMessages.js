/* global chrome */
var Messages = (function() {
	var listeners = {};

	function addListener(messageType, callback) {
		if (messageType in listeners) {
			console.error('Listener for Message:', messageType, 'already exists.');
		} else {
			listeners[messageType] = callback;
		}
	}

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		var messageType = request.type;
		var data = request.data;

		if (!(messageType in listeners)) {
			console.error('Unrecognised message type:', request);
		} else {
			var response = listeners[messageType](data);

			if (Util.isPromise(response)) {
				response.then(data => sendResponse({ data }), e => sendResponse());
				return true;
			} else {
				sendResponse({ data: response });
			}
		}
	});

	function sendMessage(messageType, data) {
		var message = {
			type: messageType,
			data: data
		};
		return new Promise(function(resolve, reject) {
			chrome.runtime.sendMessage(message, response =>
					response ? resolve(response.data) : reject(new Error(`Received empty response from type: ${messageType}`))
			);
		});
	}

	addListener(Const.msg.ECHO, data => data);

	return {
		addListener,
		send: sendMessage
	};
})();
