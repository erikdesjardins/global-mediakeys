(function(exports) {
	function extend(target /*[, ...objectN]*/) {
		Array.prototype.slice.call(arguments, 1).forEach(function(extendObj) {
			for (var prop in extendObj) {
				if (extendObj.hasOwnProperty(prop)) {
					target[prop] = extendObj[prop];
				}
			}
		});
		return target;
	}

	function isRefType(val) {
		return Object(val) === val;
	}

	function isPromise(val) {
		return val && (typeof val === 'object' || typeof val === 'function') && typeof val.then === 'function';
	}

	exports.obj = {
		extend,
		isRefType,
		isPromise
	};

	function click(ele) {
		if (!ele) {
			console.warn('Util.click: ele is undefined');
		} else if (!ele.dispatchEvent) {
			console.error('Cannot dispatch event on element:', ele);
		} else {
			ele.dispatchEvent(new MouseEvent('click', {
				view: window,
				bubbles: true,
				cancelable: true
			}));
		}
	}

	function observe(ele, options, callback) {
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(callback);
		});
		observer.observe(ele, options);
		return observer;
	}

	exports.dom = {
		click,
		observe
	};
})(window.Util = {});
