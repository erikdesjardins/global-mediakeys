/**
 * @file A wrapper around the <tt>sendMessage</tt> and <tt>onMessage</tt> APIs,
 * supporting message types and optionally asynchronous handlers.
 * @module api/messages
 */

/* global chrome */
import { apiToPromise } from '../util/function';
import { typeCheck } from '../util/types';

const listeners = new Map();

/**
 * @callback MessageListener
 * @template T
 * @param {*} data The message data.
 * @param {number} [tabId] The tabId of the sender, if sent by a tab's content script.
 * @returns {T|Promise<T, *>} The response data, optionally wrapped in a <tt>Promise</tt>.
 * Ignored if the listener is silent.
 */

/**
 * Register a listener to be invoked whenever a message of <tt>type</tt> is received.
 * Responses may be sent synchronously or asynchronously:
 * If <tt>silent</tt> is true, no response will be sent.
 * If <tt>callback</tt> returns a non-promise value, a response will be sent synchronously.
 * If <tt>callback</tt> returns a <tt>Promise</tt>, a response will be sent asynchronously when it resolves.
 * If it rejects, an invalid response will be sent to close the message channel.
 * @param {string} type
 * @param {MessageListener} callback
 * @param {boolean} [silent=false]
 * @throws {Error} If a listener for <tt>messageType</tt> already exists.
 * @returns {void}
 */
export function addListener(type, callback, { silent = false } = {}) {
	if (listeners.has(type)) {
		throw new Error(`Listener for message type: ${type} already exists.`);
	}
	listeners.set(type, {
		options: { silent },
		callback
	});
}

/**
 * Send a message to non-content scripts or to the content script at <tt>tabId</tt> (if specified).
 * Accepts one argument: either an options object or a string for <tt>type</tt>.
 * @param {string} type
 * @param {number|string} [tabId]
 * @param {*} [data]
 * @returns {Promise<*, Error>} Rejects if an invalid response is received,
 * resolves with the response data otherwise.
 */
export async function send({ type = arguments[0], tabId, data } = {}) {
	typeCheck(type, String);

	const message = { type, data };
	const target = parseInt(tabId, 10);

	const response = await (tabId ?
		apiToPromise(chrome.tabs.sendMessage)(target, message) :
		apiToPromise(chrome.runtime.sendMessage)(message)
	);

	if (!response) {
		throw new Error(`Received invalid response from message type: ${type}`);
	}

	return response.data;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	const { type, data } = request;
	const tabId = sender.tab && sender.tab.id;

	if (!listeners.has(type)) {
		throw new Error(`Unrecognised message type: ${type}`);
	}
	const listener = listeners.get(type);

	const response = listener.callback(data, tabId);

	if (listener.options.silent) {
		return false;
	}

	if (response instanceof Promise) {
		response
			.then(data => sendResponse({ data }))
			.catch(error => {
				sendResponse();
				throw error;
			});
		return true;
	}
	sendResponse({ data: response });
});
