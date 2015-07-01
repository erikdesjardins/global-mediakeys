(function(exports) {
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
