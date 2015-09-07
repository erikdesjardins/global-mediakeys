/**
 * @file The base class for a data type wrapper.
 * Exports decorators that should be applied to wrappable classes.
 * Instances of {@link Wrapper} itself are wrappable by default.
 * @module data/Wrapper
 */

const DEFAULT_VALUE = Symbol('defaultValue');
const INJECT_PROP = Symbol('injectProperty');
const WRAPPABLE_FUNCTIONS = Symbol('wrappableFunctions');
const WRAPPABLE_ACCESSORS = Symbol('wrappableAccessors');

const wrapperInjectTarget = Symbol('injectTarget');

export default
@inject(wrapperInjectTarget)
class Wrapper {
	/**
	 * Assigns an underlying object for this wrapper.
	 * @param {!Object} underlyingInstance The instance to be wrapped.
	 * @returns {Wrapper} This instance.
	 */
	wrap(underlyingInstance) {
		this._underlying = underlyingInstance;
		this.__wrapFunctions();
		this.__wrapAccessors();
		this.__exposeWrappableProperties();
		this._onWrap();
		return this;
	}

	/**
	 * Invoked after {@link wrap}.
	 * @abstract
	 * @protected
	 * @returns {void}
	 */
	_onWrap() {}

	/**
	 * Invoked when a wrapped function is invoked.
	 * @abstract
	 * @protected
	 * @param {function(...*): *} func The underlying function.
	 * @param {*[]} args The arguments with which the function was invoked.
	 * @param {string} name The function's property name.
	 * @returns {*} The value to be returned from the wrapped function.
	 */
	_functionWrapper(func, args, name) {
		return func(...args);
	}

	/**
	 * Invoked when a wrapped getter is invoked.
	 * @abstract
	 * @protected
	 * @param {function(): *} get A function that will invoke the underlying getter.
	 * @param {string} name The getter's property name.
	 * @returns {*} The value to be returned from the wrapped getter.
	 */
	_getterWrapper(get, name) {
		return get();
	}

	/**
	 * Invoked when a wrapped setter is invoked.
	 * @abstract
	 * @protected
	 * @template T
	 * @param {function(T): void} set A function that will invoke the underlying setter.
	 * @param {T} value The value assigned to the setter.
	 * @param {string} name The setter's property name.
	 * @returns {void}
	 */
	_setterWrapper(set, value, name) {
		set(value);
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
	 * Applies wrappers to functions decorated with {@link wrappable}.
	 * @private
	 * @returns {void}
	 */
	__wrapFunctions() {
		const properties = this._underlying[WRAPPABLE_FUNCTIONS] || [];
		// Until Chrome supports ES6 proxies
		properties.forEach(propName => {
			this[propName] = (...args) => this._functionWrapper((...a) => this._underlying[propName](...a), args, propName);
		});
	}

	/**
	 * Applies wrappers to accessors decorated with {@link wrappable}.
	 * @private
	 * @returns {void}
	 */
	__wrapAccessors() {
		const properties = this._underlying[WRAPPABLE_ACCESSORS] || [];
		// Until Chrome supports ES6 proxies
		properties.forEach(([propName, hasGetter, hasSetter]) => {
			const descriptor = {};
			if (hasGetter) {
				descriptor.get = () => this._getterWrapper(() => this._underlying[propName], propName);
			}
			if (hasSetter) {
				descriptor.set = value => this._setterWrapper(v => this._underlying[propName] = v, value, propName);
			}
			Reflect.defineProperty(this, propName, descriptor);
		});
	}

	/**
	 * Allows the wrapper itself to be wrapped.
	 * @private
	 * @returns {void}
	 */
	__exposeWrappableProperties() {
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
