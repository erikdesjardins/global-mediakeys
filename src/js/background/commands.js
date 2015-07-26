/* global chrome */
var Commands = (function() {
	var listeners = {};

	function addListener(commandName, callback) {
		if (commandName in listeners) {
			console.error('Listener for Command:', commandName, 'already exists.');
		} else {
			listeners[commandName] = callback;
		}
	}

	chrome.commands.onCommand.addListener(function(commandName) {
		if (!(commandName in listeners)) {
			console.error('Unrecognised command:', commandName);
		} else {
			listeners[commandName]();
		}
	});

	return {
		addListener
	};
})();
