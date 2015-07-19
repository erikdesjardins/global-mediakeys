(function(exports) {'use strict';
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
			listeners[messageType](data)
				.then(function(response) {
					sendResponse({ data: response });
				}, sendResponse);
			return true;
		}
	});

	function sendMessage(messageType, data) {
		var message = {
			type: messageType,
			data: data
		};
		return new Promise(function(resolve, reject) {
			chrome.runtime.sendMessage(message, function(response) {
				if (response) {
					resolve(response.data);
				} else {
					reject();
				}
			});
		});
	}

	exports.addListener = addListener;
	exports.send = sendMessage;

	addListener(Const.msg.ECHO, function(data) {
		return data;
	});
})(/* jshint -W020 */ Messages = {});
