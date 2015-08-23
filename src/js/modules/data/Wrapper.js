/**
 * @file The base class for a data type wrapper.
 * Exports decorators that should be applied to wrappable classes.
 * Instances of {@link Wrapper} itself are wrappable by default.
 * @module data/Wrapper
 */

import { identity as id } from '../util/function';

const DEFAULT_VALUE = Symbol('defaultValue');
const INJECT_PROP = Symbol('injectProperty');
const WRAPPABLE_FUNCTIONS = Symbol('wrappableFunctions');
const WRAPPABLE_ACCESSORS = Symbol('wrappableAccessors');

const wrapperInjectTarget = Symbol('injectTarget');

export default
@inject(wrapperInjectTarget)
class Wrapper {
	/**
	 * @class
	 * @param {!Object} underlyingInstance The object to be wrapped.
	 */
	constructor(underlyingInstance) {
		this._underlying = underlyingInstance;
		this._exposeWrappableProperties();
	}

	/**
	 * Subclasses must call this function in their constructors.
	 * <tt>wrapperFactory</tt> accepts a function to be wrapped and its property name,
	 * and should return a function wrapping it.
	 * @protected
	 * @param {function(function(...*): *, string): function(...*): *} [wrapperFactory=identity]
	 * @returns {void}
	 */
	_wrapFunctions(wrapperFactory = id) {
		const properties = this._underlying[WRAPPABLE_FUNCTIONS] || [];
		// Until Chrome supports ES6 proxies
		properties.forEach(propName => {
			this[propName] = wrapperFactory(::this._underlying[propName], propName);
		});
	}

	/**
	 * Subclasses must call this function in their constructors.
	 * <tt>getterFactory</tt> accepts a function that will invoke the underlying getter and its property name,
	 * and should return a function wrapping it.
	 * <tt>setterFactory</tt> behaves identically for the respective setter.
	 * @protected
	 * @template T
	 * @param {function(function(): T, string): function(): *} [getterFactory=identity]
	 * @param {function(function(T): void, string): function(T): void} [setterFactory=identity]
	 * @returns {void}
	 */
	_wrapAccessors(getterFactory = id, setterFactory = id) {
		const properties = this._underlying[WRAPPABLE_ACCESSORS] || [];
		// Until Chrome supports ES6 proxies
		properties.forEach(([propName, hasGetter, hasSetter]) => {
			const descriptor = {};
			if (hasGetter) {
				descriptor.get = getterFactory(() => this._underlying[propName], propName);
			}
			if (hasSetter) {
				descriptor.set = setterFactory(value => this._underlying[propName] = value, propName);
			}
			Reflect.defineProperty(this, propName, descriptor);
		});
	}

	/**
	 * @protected
	 * @returns {*} The default value that should be injected,
	 * for wrappers that call {@link _inject}.
	 */
	_getDefaultValue() {
		return this._underlying[DEFAULT_VALUE];
	}

	/**
	 * @protected
	 * @param {*} value Will replace the wrapped object's underlying data store.
	 * @returns {void}
	 */
	_inject(value) {
		const propName = this._underlying[INJECT_PROP];
		this._underlying[propName] = value;
	}

	/**
	 * @protected
	 * @returns {*} The value of the wrapped object's underlying data store.
	 */
	_extract() {
		const propName = this._underlying[INJECT_PROP];
		return this._underlying[propName];
	}

	set [wrapperInjectTarget](value) {
		this._inject(value);
	}

	get [wrapperInjectTarget]() {
		return this._extract();
	}

	/**
	 * Allows the wrapper itself to be wrapped.
	 * @private
	 * @returns {void}
	 */
	_exposeWrappableProperties() {
		this[DEFAULT_VALUE] = this._underlying[DEFAULT_VALUE];

		// Not using .push() to avoid modifying the prototype
		this[WRAPPABLE_FUNCTIONS] = (this[WRAPPABLE_FUNCTIONS] || [])
			.concat(this._underlying[WRAPPABLE_FUNCTIONS] || []);

		this[WRAPPABLE_ACCESSORS] = (this[WRAPPABLE_ACCESSORS] || [])
			.concat(this._underlying[WRAPPABLE_ACCESSORS] || []);
	}
}

/**
 * A decorator for classes only (not methods).
 * Wrappable data types must be annotated with this function.
 * Subclasses of {@link Wrapper} may be annotated with this function,
 * but <tt>defaultValue</tt> will be overwritten by the default value of the wrapped object.
 * @param {string|!Symbol} prop The property describing the underlying data store used by the wrapped class.
 * @param {*} [defaultValue] The value to be injected by default.
 * @returns {function(Function, string): void} The annotator function.
 */
export function inject(prop, defaultValue) {
	return (target, name) => {
		if (name) {
			throw new Error('@inject is a class-level decorator.');
		}

		target.prototype[INJECT_PROP] = prop;
		target.prototype[DEFAULT_VALUE] = defaultValue;
	};
}

/**
 * A decorator for methods only (not classes).
 * Indicates that a function or accessor should be wrapped and exposed through the wrapper class.
 * Wrappable classes should have at least one method annotated with this function.
 * Subclasses of {@link Wrapper} may have methods annotated with this function,
 * to expose additional functionality through another wrapper.
 * @param {Function} target The class's prototype.
 * @param {string} name
 * @param {Object} descriptor
 * @returns {void}
 */
export function wrappable(target, name, descriptor) {
	if (!descriptor) {
		throw new Error('@wrappable is a method-level decorator.');
	}

	if ('value' in descriptor) {
		target[WRAPPABLE_FUNCTIONS] = target[WRAPPABLE_FUNCTIONS] || [];
		target[WRAPPABLE_FUNCTIONS].push(name);
	} else {
		target[WRAPPABLE_ACCESSORS] = target[WRAPPABLE_ACCESSORS] || [];
		target[WRAPPABLE_ACCESSORS].push([name, 'get' in descriptor, 'set' in descriptor]);
	}
}
