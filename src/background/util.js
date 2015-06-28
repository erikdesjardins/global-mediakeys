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

	exports.each = each;
	exports.some = some;
	exports.every = every;
	exports.firstKey = firstKey;
})(/* jshint -W020 */ Util = {});
