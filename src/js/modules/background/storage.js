/* global chrome */
import { isRefType } from '../util';

export function set(key, value) {
	const obj = {};
	obj[key] = value;
	return new Promise((resolve, reject) => {
		chrome.storage.local.set(obj, () =>
				chrome.runtime.lastError ? reject(new Error(chrome.runtime.lastError)) : resolve()
		);
	});
}

export function get(key, defaultValue) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(key, items => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError));
			} else if (items[key] === undefined) {
				resolve(defaultValue);
			} else {
				resolve(items[key]);
			}
		});
	});
}

const hasListener = {};

async function getAndSetOnSuspend(key, defaultValue) {
	const val = await get(key, defaultValue);
	if (!isRefType(val)) {
		console.warn('Key:', key, 'value:', val, 'is not a reference type - changes cannot be persisted.');
	} else if (hasListener[key]) {
		console.error('Key:', key, 'has been previously fetched with autopersist.');
	} else {
		chrome.runtime.onSuspend.addListener(() => set(key, val));
		hasListener[key] = true;
	}
	return val;
}

export { getAndSetOnSuspend as autopersist };
