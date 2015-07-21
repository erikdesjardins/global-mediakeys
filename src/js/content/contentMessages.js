/* global chrome */
(function(exports) {
	var listeners = {};

	function addListener(types, callback) {
		[].concat(types).forEach(function(messageType) {
			if (messageType in listeners) {
				console.error('Listener for Message:', messageType, 'already exists.');
			} else {
				listeners[messageType] = callback;
			}
		});
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
					response ? resolve(response.data) : reject(new Error('Received empty response.'))
			);
		});
	}

	exports.addListener = addListener;
	exports.send = sendMessage;

	addListener(Const.msg.ECHO, data => data);
})(window.Messages = {});
