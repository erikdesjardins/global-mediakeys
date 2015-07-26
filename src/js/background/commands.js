/* global chrome */
var Commands = (() => {
	var listeners = {};

	function addListener(commandName, callback) {
		if (commandName in listeners) {
			console.error('Listener for Command:', commandName, 'already exists.');
		} else {
			listeners[commandName] = callback;
		}
	}

	chrome.commands.onCommand.addListener(commandName => {
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
