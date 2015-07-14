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
			console.error('Received message without tabId:', request, sender);
		} else if (!(messageType in listeners)) {
			console.error('Unrecognised message type:', request, sender);
		} else {
			var response = {
				data: listeners[messageType](data, tabId)
			};
			sendResponse(response);
		}
	});

	function sendMessage(messageType, tabId, data) {
		var message = {
			type: messageType,
			data: data
		};
		var target = parseInt(tabId, 10);
		return new Promise(function(resolve, reject) {
			chrome.tabs.sendMessage(target, message, function(response) {
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
