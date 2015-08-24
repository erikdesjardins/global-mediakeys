/**
 * @file A {@link Wrapper} that logs function and accessor calls.
 * @module data/LoggingWrapper
 */

import Logger from '../util/Logger';
import Wrapper from './Wrapper';

export default class LoggingWrapper extends Wrapper {
	/**
	 * @class
	 * @param {!Object} underlyingInstance
	 * @param {string} tag Will be passed to {@link Logger}.
	 */
	constructor(underlyingInstance, tag) {
		super(underlyingInstance);

		const log = new Logger(tag);

		this._wrapAccessors((get, name) => () => {
			log.v(name, '=>');
			return get();
		}, (set, name) => value => {
			log.v(name, '<=');
			set(value);
		});

		this._wrapFunctions((func, name) => (...args) => {
			log.v(`${name}()`);
			return func(...args);
		});
	}
}
