// Babel runtime doesn't polyfill prototype functions
import 'babel-runtime/node_modules/core-js/es6/array';

import * as Const from '../constants';
import { autopersist } from './storage';

const isReady = autopersist(Const.storage.TABS, []);

function _findIndex(tabs, tabId) {
	return tabs.findIndex(tab => tab.id === tabId);
}

function _validIndex(tabs, tabId) {
	const index = _findIndex(tabs, tabId);
	if (index === -1) {
		throw new Error(`Tab: ${tabId} not found.`);
	}
	return index;
}

function _exists(tabs, tabId) {
	return _findIndex(tabs, tabId) !== -1;
}

function _get(tabs, tabId) {
	return tabs[_validIndex(tabs, tabId)];
}

function _add(tabs, tabId, data) {
	tabs.unshift({ id: tabId, data: data });
}

function _remove(tabs, tabId) {
	return tabs.splice(_validIndex(tabs, tabId), 1)[0];
}

function _promote(tabs, tabId) {
	tabs.unshift(_remove(tabs, tabId));
}

export async function add(tabId) {
	const tabs = await isReady;
	if (_exists(tabs, tabId)) {
		_remove(tabs, tabId);
		console.warn('Tab:', tabId, 'was not unregistered, will be overwritten.');
	}
	_add(tabs, tabId, {});
	console.info('Registered tab:', tabId);
}

export async function remove(tabId) {
	const tabs = await isReady;
	if (!_exists(tabs, tabId)) {
		throw new Error(`Cannot unregister non-extant tab: ${tabId}`);
	}
	_remove(tabs, tabId);
	console.info('Unregistered tab:', tabId);
}

export async function update(tabId, key, value) {
	const tabs = await isReady;
	if (!_exists(tabs, tabId)) {
		throw new Error(`Cannot update unregistered tab: ${tabId}`);
	}
	const tab = _get(tabs, tabId);
	if (tab.data[key] !== value) {
		tab.data[key] = value;
		_promote(tabs, tabId);
		console.log('Updated tab:', tabId, 'with:', key, '=', value);
	}
}

export async function first() {
	const tabs = await isReady;
	if (!tabs[0]) {
		throw new Error('There are no registered tabs.');
	}
	return { tabId: tabs[0].id, tab: tabs[0].data };
}

export async function each(callback) {
	const tabs = await isReady;
	await Promise.all(tabs.map(tab => callback({ tabId: tab.id, tab: tab.data })));
}
