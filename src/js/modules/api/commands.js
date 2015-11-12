/**
 * @file A simple wrapper around <tt>chrome.commands</tt>.
 * @module api/commands
 */

const listeners = new Map();

/**
 * Register a listener to be invoked whenever <tt>commandName</tt> is fired.
 * @param {string} commandName
 * @param {function(): void} callback
 * @throws {Error} If a listener for <tt>commandName</tt> already exists.
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
