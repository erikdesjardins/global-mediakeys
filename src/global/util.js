(function(exports) {
	function each(obj, callback) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				callback(obj[prop], prop, obj);
			}
		}
	}

	function some(obj, callback) {
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
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				return prop;
			}
		}
	}

	function click(ele) {
		if (typeof ele === 'string') {
			console.log('Util.click: selecting element', ele);
			ele = document.querySelector(ele);
		}

		if (!ele.dispatchEvent) {
			console.error('Cannot dispatch event on element:', ele);
		} else {
			ele.dispatchEvent(new MouseEvent('click', {
				view: window,
				bubbles: true,
				cancelable: true
			}));
		}
	}

	exports.each = each;
	exports.some = some;
	exports.every = every;
	exports.firstKey = firstKey;
	exports.click = click;
})(/* jshint -W020 */ Util = {});
