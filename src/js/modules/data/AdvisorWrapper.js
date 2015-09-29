/**
 * @file A {@link Wrapper} that provides access to the results of specific function and accessor calls,
 * but does not grant control over when the wrapped functions/accessors are invoked.
 * @module data/AdvisorWrapper
 */

import { toMap } from '../util/object';
import Wrapper from './Wrapper';

export default class AdvisorWrapper extends Wrapper {
	/**
	 * @callback FunctionAdvisor
	 * @param {*[]} args The arguments with which the wrapped function was called.
	 * @param {*} result The value returned by the wrapped function.
	 * @returns {void}
	 */

	/**
	 * @callback GetterAdvisor
	 * @param {*} value The value returned by the wrapped getter.
	 * @returns {void}
	 */

	/**
	 * @callback SetterAdvisor
	 * @param {*} The value assigned to the wrapped setter.
	 * @returns {void}
	 */

	/**
	 * Accepts three dictionaries of advisor functions.
	 * Each advisor function will be invoked when the corresponding wrapped function/accessor is invoked.
	 * @class
	 * @param {Object<string, FunctionAdvisor>} functionAdvisors
	 * @param {Object<string, GetterAdvisor>} getterAdvisors
	 * @param {Object<string, SetterAdvisor>} setterAdvisors
	 */
	constructor(functionAdvisors = {}, getterAdvisors = {}, setterAdvisors = {}) {
		super();
		this._functionAdvisors = toMap(functionAdvisors);
		this._getterAdvisors = toMap(getterAdvisors);
		this._setterAdvisors = toMap(setterAdvisors);
	}

	_functionWrapper(func, args, name) {
		const result = func(...args);
		if (this._functionAdvisors.has(name)) {
			this._functionAdvisors.get(name)(args, result);
		}
		return result;
	}

	_getterWrapper(get, name) {
		const value = get();
		if (this._getterAdvisors.has(name)) {
			this._getterAdvisors.get(name)(value);
		}
		return value;
	}

	_setterWrapper(set, value, name) {
		set(value);
		if (this._setterAdvisors.has(name)) {
			this._setterAdvisors.get(name)(value);
		}
	}
}

