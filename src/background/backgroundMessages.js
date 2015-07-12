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
		var tabId = sender.tab && sender.tab.id;

		if (!tabId) {
			console.error('Received content->background message without tabId:', request, sender);
		} else if (!(messageType in listeners)) {
			console.error('Unrecognised content->background message type:', request, sender);
		} else {
			sendResponse(listeners[messageType](data, tabId));
		}
	});

	function sendMessage(messageType, tabId, data) {
		var message = {
			type: messageType,
			data: data
		};
		var target = parseInt(tabId, 10);
		return new Promise(function(resolve, reject) {
			var timeout = setTimeout(reject, Const.req.TIMEOUT);
			function success() {
				clearTimeout(timeout);
				resolve.apply(null, arguments);
			}
			chrome.tabs.sendMessage(target, message, success);
		});
	}

	exports.addListener = addListener;
	exports.send = sendMessage;
})(/* jshint -W020 */ Messages = {});
