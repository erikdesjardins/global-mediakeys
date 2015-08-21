/**
 * @file Manages a stack of tabs, bringing each one to the top when it is updated.
 * Each tab has a unique <tt>tabId</tt> and stores a set of key-value data.
 * @module background/tabmanager
 */

// Babel runtime doesn't polyfill prototype functions
import 'babel-runtime/node_modules/core-js/es6/array';

import * as Const from '../constants';
import { equals } from '../util';
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

function _add(tabs, tabId, tabData) {
	tabs.unshift({ id: tabId, data: tabData });
}

function _remove(tabs, tabId) {
	return tabs.splice(_validIndex(tabs, tabId), 1)[0];
}

function _promote(tabs, tabId) {
	tabs.unshift(_remove(tabs, tabId));
}

/**
 * Adds a new tab to the registry.
 * If a tab with the same <tt>tabId</tt> exists in the registry, it will be overwritten.
 * @param {number} tabId The id used by Chrome to identify the tab.
 * @returns {Promise<void>} Resolves when the tab has been added.
 */
export async function add(tabId) {
	const tabs = await isReady;
	if (_exists(tabs, tabId)) {
		_remove(tabs, tabId);
		console.warn('Tab:', tabId, 'was not unregistered, will be overwritten.');
	}
	_add(tabs, tabId, {});
	console.info('Registered tab:', tabId);
}

/**
 * Removes a tab from the registry.
 * @param {number} tabId The id used by Chrome to identify the tab.
 * @returns {Promise<void, Error>} Rejects if the tab does not exist in the registry,
 * resolves when the tab has been removed otherwise.
 */
export async function remove(tabId) {
	const tabs = await isReady;
	if (!_exists(tabs, tabId)) {
		throw new Error(`Cannot unregister non-extant tab: ${tabId}`);
	}
	_remove(tabs, tabId);
	console.info('Unregistered tab:', tabId);
}

/**
 * Updates the data stored for a specified tab with a key-value pair.
 * An update may not be performed if the existing value is equivalent.
 * @param {number} tabId The id used by Chrome to identify the tab.
 * @param {string} key
 * @param {*} value
 * @returns {Promise<void, Error>} Rejects if the tab does not exist in the registry,
 * resolves when the data has been updated otherwise.
 */
export async function update(tabId, key, value) {
	const tabs = await isReady;
	if (!_exists(tabs, tabId)) {
		throw new Error(`Cannot update unregistered tab: ${tabId}`);
	}
	const tab = _get(tabs, tabId);
	if (!equals(tab.data[key], value)) {
		tab.data[key] = value;
		_promote(tabs, tabId);
		console.log('Updated tab:', tabId, 'with:', key, '=', value);
	}
}

/**
 * Information about a tab.
 * @typedef {!Object} TabInfo
 * @property {number} tabId The id used by Chrome to identify the tab.
 * @property {!Object} tab The data associated with the tab.
 */

/**
 * Gets the information about the tab on top of the stack.
 * @returns {Promise<TabInfo, Error>} Rejects if no tabs are registered,
 * resolves with info about the tab otherwise.
 */
export async function first() {
	const tabs = await isReady;
	if (!tabs[0]) {
		throw new Error('There are no registered tabs.');
	}
	return { tabId: tabs[0].id, tab: tabs[0].data };
}

/**
 * Executes a callback for each tab in the stack.
 * Order of execution is not defined.
 * @param {function(TabInfo): *} callback
 * @returns {Promise<void>} Resolves when the promises returned by each <tt>callback</tt> invocation have been resolved.
 * Return values are cast to <tt>Promise</tt> by standard ES6 rules.
 */
export async function each(callback) {
	const tabs = await isReady;
	await Promise.all(tabs.map(tab => callback({ tabId: tab.id, tab: tab.data })));
}
