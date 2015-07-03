(function(exports) {'use strict';
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

	exports.obj = {
		extend: extend,
		isRefType: isRefType
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
		click: click,
		observe: observe
	};
})(/* jshint -W020 */ Util = {});
