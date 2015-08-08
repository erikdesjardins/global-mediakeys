/* global chrome */
import * as Const from '../constants';
import { isPromise } from '../util';

const listeners = {};

export function addListener(messageType, callback) {
	if (messageType in listeners) {
		console.error('Listener for Message:', messageType, 'already exists.');
	} else {
		listeners[messageType] = callback;
	}
}

function sendMessage(type, data) {
	const message = { type, data };

	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(message, response =>
				response ? resolve(response.data) : reject(new Error(`Received empty response from type: ${type}`))
		);
	});
}

export { sendMessage as send };

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	const { type, data } = request;

	if (!(type in listeners)) {
		console.error('Unrecognised message type:', request, sender);
	} else {
		const response = listeners[type](data);

		if (isPromise(response)) {
			response.then(data => sendResponse({ data }), e => sendResponse());
			return true;
		} else {
			sendResponse({ data: response });
		}
	}
});

addListener(Const.msg.ECHO, data => data);
