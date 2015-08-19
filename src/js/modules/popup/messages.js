/**
 * @file A wrapper around the <tt>sendMessage</tt> and <tt>onMessage</tt> APIs,
 * supporting message types and optionally asynchronous handlers.
 * @module popup/messages
 */

/* global chrome */
const listeners = {};

/**
 * Register a listener to be invoked whenever a message of <tt>type</tt> is received.
 * No responses will be sent, and the return value of <tt>callback</tt> is ignored.
 * @template T
 * @param {string} type
 * @param {function(*, number=): void} callback Accepts the message data and tabId of the sender, if available.
 * @throws {Error} If a listener for <tt>messageType</tt> already exists.
 * @returns {void}
 */
export function addListener(type, callback) {
	if (type in listeners) {
		throw new Error(`Listener for message type: ${type} already exists.`);
	}
	listeners[type] = callback;
}

/**
 * Send a message to the background page.
 * @param {string} type
 * @param {*} [data]
 * @returns {Promise<*, Error>} Rejects if an invalid response is received,
 * resolves with the response data otherwise.
 */
export function send(type, data) {
	const message = { type, data };

	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(message, response =>
				response ? resolve(response.data) : reject(new Error(`Received invalid response from message type: ${type}`))
		);
	});
}

chrome.runtime.onMessage.addListener((request, sender) => {
	const { type, data } = request;
	const tabId = sender.tab && sender.tab.id;

	if (!(type in listeners)) {
		throw new Error(`Unrecognised message type: ${type}`);
	}

	listeners[type](data, tabId);
	// Responses handled by the background page
});
