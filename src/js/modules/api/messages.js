/**
 * @file A wrapper around the <tt>sendMessage</tt> and <tt>onMessage</tt> APIs,
 * supporting message types and optionally asynchronous handlers.
 * @module api/messages
 */

/* global chrome */
import { apiToPromise } from '../util/function';
import { typeCheck } from '../util/types';

const listeners = {};

/**
 * Register a listener to be invoked whenever a message of <tt>type</tt> is received.
 * Responses may be sent synchronously or asynchronously, depending on the return value of <tt>callback</tt>.
 * @template T
 * @param {string} type
 * @param {function(*, number=): (T|Promise<T, *>)} callback Accepts the message data and tabId of the sender, if available.
 * If <tt>silent</tt> is true, no response will be sent.
 * If <tt>callback</tt> returns a non-promise value, a response will be sent synchronously.
 * If <tt>callback</tt> returns a <tt>Promise</tt>, a response will be sent asynchronously when it resolves.
 * If it rejects, an invalid response will be sent to close the message channel.
 * @param {boolean} [silent=false]
 * @throws {Error} If a listener for <tt>messageType</tt> already exists.
 * @returns {void}
 */
export function addListener(type, callback, { silent = false } = {}) {
	if (type in listeners) {
		throw new Error(`Listener for message type: ${type} already exists.`);
	}
	listeners[type] = {
		options: { silent },
		callback
	};
}

/**
 * Send a message to the background page or the content script at a specified <tt>tabId</tt>.
 * Accepts either an options object or a string for <tt>type</tt>.
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

	if (!(type in listeners)) {
		throw new Error(`Unrecognised message type: ${type}`);
	}

	const response = listeners[type].callback(data, tabId);

	if (listeners[type].options.silent) {
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
