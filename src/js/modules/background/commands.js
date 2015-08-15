/* global chrome */
const listeners = {};

export function addListener(commandName, callback) {
	if (commandName in listeners) {
		throw new Error('Listener for command:', commandName, 'already exists.');
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
