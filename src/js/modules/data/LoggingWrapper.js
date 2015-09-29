/**
 * @file A {@link Wrapper} that logs all function and accessor calls.
 * @module data/LoggingWrapper
 */

import { intersperse } from '../util/array';
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
		const result = func(...args);
		this._log.v(name, '(', ...intersperse(args, ','), ')', '=>', result);
		return result;
	}

	_getterWrapper(get, name) {
		const value = get();
		this._log.v(name, '=>', value);
		return value;
	}

	_setterWrapper(set, value, name) {
		set(value);
		this._log.v(name, '<=', value);
	}
}
