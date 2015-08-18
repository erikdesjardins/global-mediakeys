/**
 * @file A simple wrapper around <tt>chrome.commands</tt>.
 * @module background/commands
 */

/* global chrome */
const listeners = {};

/**
 * Register a listener to be invoked whenever <tt>commandName</tt> is fired.
 * @param {string} commandName
 * @param {function(): void} callback
 * @throws {Error} If a listener for <tt>commandName</tt> already exists.
 * @returns {void}
 */
export function addListener(commandName, callback) {
	if (commandName in listeners) {
		throw new Error(`Listener for command: ${commandName} already exists.`);
	}
	listeners[commandName] = callback;
}

chrome.commands.onCommand.addListener(commandName => {
	if (!(commandName in listeners)) {
		throw new Error(`Unrecognised command: ${commandName}`);
	}
	listeners[commandName]();
});
