(function(exports) {
	var listeners = {};

	function addListener(types, callback) {
		[].concat(types).forEach(function(messageType) {
			if (messageType in listeners) {
				throw new Error('Listener for Message:' + messageType + ' already exists.');
			} else {
				listeners[messageType] = callback;
			}
		});
	}

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		var messageType = request.type;
		var data = request.data;

		if (!(messageType in listeners)) {
			console.error('Unrecognised background->content message:', request);
		} else {
			sendResponse(listeners[messageType](data));
		}
	});

	function sendMessage(messageType, data, callback) {
		var message = {
			type: messageType,
			data: data
		};
		chrome.runtime.sendMessage(message, callback);
	}

	exports.addListener = addListener;
	exports.send = sendMessage;
})(/* jshint -W020 */ Messages = {});
