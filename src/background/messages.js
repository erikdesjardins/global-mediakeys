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
		var tabId = sender.tab && sender.tab.id;

		if (!tabId) {
			console.error('Recieved content->background message without tabId:', request, sender);
		} else if (!(messageType in listeners)) {
			console.error('Unrecognised content->background message type:', request, sender);
		} else {
			sendResponse(listeners[messageType](data, tabId));
		}
	});

	function sendMessage(messageType, target, data, callback) {
		var message = {
			type: messageType,
			data: data
		};
		var tabIds = [].concat(target);
		tabIds.forEach(function(tabId) {
			chrome.tabs.sendMessage(tabId, message, callback);
		});
	}

	exports.addListener = addListener;
	exports.send = sendMessage;
})(/* jshint -W020 */ Messages = {});
