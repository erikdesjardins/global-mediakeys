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
			sendResponse(listeners[messageType](data));
		}
	});

	function sendMessage(messageType, data) {
		var message = {
			type: messageType,
			data: data
		};
		return new Promise(function(resolve, reject) {
			var timeout = setTimeout(reject, Const.req.TIMEOUT);
			function success() {
				clearTimeout(timeout);
				resolve.apply(null, arguments);
			}
			chrome.runtime.sendMessage(message, success);
		});
	}

	exports.addListener = addListener;
	exports.send = sendMessage;
})(/* jshint -W020 */ Messages = {});
