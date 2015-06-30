(function(exports) {
	function checkIsObject(val) {
		if (typeof val !== 'object') {
			throw new Error(val + ' is not an object.');
		}
	}

	function each(obj, callback) {
		checkIsObject(obj);
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				callback(obj[prop], prop, obj);
			}
		}
	}

	function some(obj, callback) {
		checkIsObject(obj);
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				if (callback(obj[prop], prop, obj)) {
					return true;
				}
			}
		}
		return false;
	}

	function every(obj, callback) {
		checkIsObject(obj);
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				if (!callback(obj[prop], prop, obj)) {
					return false;
				}
			}
		}
		return true;
	}

	function firstKey(obj) {
		checkIsObject(obj);
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				return prop;
			}
		}
	}

	function isEmpty(obj) {
		checkIsObject(obj);
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				return false;
			}
		}
		return true;
	}

	exports.obj = {
		each: each,
		some: some,
		every: every,
		firstKey: firstKey,
		isEmpty: isEmpty
	};

	function click(ele) {
		if (!ele) {
			console.error('Utils.click: ele is undefined');
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

	function observeClasses(ele, callback) {
		new MutationObserver(function(mutations) {
			mutations.forEach(function(mutationRecord) {
				callback(mutationRecord.target.classList);
			});
		}).observe(ele, { attributes: true, attributeFilter: ['class'] });
	}

	exports.dom = {
		click: click,
		observeClasses: observeClasses
	};
})(/* jshint -W020 */ Util = {});
