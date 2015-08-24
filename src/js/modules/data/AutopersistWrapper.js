/**
 * @file A {@link Wrapper} that fetches/stores the value using {@link Storage}<tt>.autopersist</tt>.
 * All <tt>@wrappable</tt> functions will be wrapped in promises.
 * @module data/AutopersistWrapper
 */

import * as Storage from '../api/storage';
import Wrapper from './Wrapper';

export default class AutopersistWrapper extends Wrapper {
	/**
	 * @class
	 * @param {!Object} underlyingInstance
	 * @param {string} storageKey Will be passed to {@link Storage}<tt>.autopersist</tt>.
	 */
	constructor(underlyingInstance, storageKey) {
		super(underlyingInstance);

		const isReady = this._setup(storageKey);

		this._wrapAccessors();
		this._wrapFunctions(func => async (...args) => {
			await isReady;
			return func(...args);
		});
	}

	async _setup(storageKey) {
		this._inject(await Storage.autopersist(storageKey, this._getDefaultValue()));
	}
}
