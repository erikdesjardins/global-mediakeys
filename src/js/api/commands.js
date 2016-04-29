/**
 * @file A simple wrapper around `chrome.commands`.
 * @module api/commands
 */

const listeners = new Map();

/**
 * Register a listener to be invoked whenever `commandName` is fired.
 * @param {string} commandName
 * @param {function(): void} callback
 * @throws {Error} If a listener for `commandName` already exists.
 * @returns {void}
 */
export function addListener(commandName, callback) {
	if (listeners.has(commandName)) {
		throw new Error(`Listener for command: ${commandName} already exists.`);
	}
	listeners.set(commandName, callback);
}

chrome.commands.onCommand.addListener(commandName => {
	if (!listeners.has(commandName)) {
		throw new Error(`Unrecognised command: ${commandName}`);
	}
	listeners.get(commandName)();
});
