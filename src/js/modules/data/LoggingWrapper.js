/**
 * @file A {@link Wrapper} that logs function and accessor calls.
 * @module data/LoggingWrapper
 */

import Logger from '../util/Logger';
import Wrapper from './Wrapper';

export default class LoggingWrapper extends Wrapper {
	/**
	 * @class
	 * @param {string} tag Will be passed to {@link Logger}.
	 */
	constructor(tag) {
		super();
		this._log = new Logger(tag);
	}

	_functionWrapper(func, args, name) {
		this._log.v(`${name}()`);
		return func(...args);
	}

	_getterWrapper(get, name) {
		this._log.v(name, '=>');
		return get();
	}

	_setterWrapper(set, value, name) {
		this._log.v(name, '<=');
		set(value);
	}
}
