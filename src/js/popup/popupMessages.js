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

	chrome.runtime.onMessage.addListener(function(request, sender) {
		var messageType = request.type;
		var data = request.data;
		var tabId = sender.tab && sender.tab.id;

		if (!(messageType in listeners)) {
			console.error('Unrecognised message type:', request, sender);
		} else {
			listeners[messageType](data, tabId);
			// Responses handled by the background page
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
