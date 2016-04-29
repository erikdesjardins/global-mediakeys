/**
 * @file A {@link Wrapper} that fetches/stores the value using {@link Storage#autopersist}.
 * All `@wrappable` functions will be wrapped in promises.
 * @module data/AutopersistWrapper
 */

import Wrapper from './Wrapper';
import * as Storage from '../api/storage';

export default class AutopersistWrapper extends Wrapper {
	/**
	 * @class
	 * @param {string} storageKey Will be passed to {@link Storage#autopersist}.
	 */
	constructor(storageKey) {
		super();
		this._key = storageKey;
	}

	_onWrap() {
		this._isReady = this._setup();
	}

	async _functionWrapper(func, args) {
		await this._isReady;
		return func(...args);
	}

	async _setup() {
		this._inject(await Storage.autopersist(this._key, this._getDefaultValue()));
	}
}
