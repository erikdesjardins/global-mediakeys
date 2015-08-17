/* global chrome */
import { isRefType } from '../util';

export function set(key, value) {
	const obj = { [key]: value };
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
			} else if (!(key in items)) {
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
		throw new TypeError(`Key: ${key}, value: ${val}, is not a reference type - changes cannot be persisted.`);
	} else if (hasListener[key]) {
		throw new Error(`Key: ${key}, has been previously fetched with autopersist.`);
	}

	chrome.runtime.onSuspend.addListener(() => set(key, val));
	hasListener[key] = true;

	return val;
}

export { getAndSetOnSuspend as autopersist };
